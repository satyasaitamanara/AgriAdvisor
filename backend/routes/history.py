from flask import Blueprint, request, jsonify, send_from_directory, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Recommendation, PestReport, SoilTest
from datetime import datetime, timedelta
import os
import json

history_bp = Blueprint('history', __name__)

@history_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    try:
        farmer_id = get_jwt_identity()
        
        # Get query parameters for filtering
        search_term = request.args.get('search', '')
        date_filter = request.args.get('date_filter', 'all')
        sort_by = request.args.get('sort_by', 'date')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Base query
        query = Recommendation.query.filter_by(farmer_id=farmer_id)
        
        # Apply date filter
        if date_filter != 'all':
            now = datetime.now()
            if date_filter == 'week':
                start_date = now - timedelta(days=7)
            elif date_filter == 'month':
                start_date = now - timedelta(days=30)
            elif date_filter == 'quarter':
                start_date = now - timedelta(days=90)
            else:
                start_date = now - timedelta(days=365)
            
            query = query.filter(Recommendation.created_at >= start_date)
        
        # Execute query
        recommendations = query.order_by(Recommendation.created_at.desc()).all()
        
        # Transform data for frontend
        result = []
        for rec in recommendations:
            try:
                input_data = rec.input_json or {}
                recommended_data = rec.recommended_json or {}
                
                # Extract crop names from recommended data - FIXED
                crops = []
                if isinstance(recommended_data, dict):
                    # Try different possible keys for crop name
                    recommended_crop = recommended_data.get('recommended_crop')
                    if recommended_crop:
                        crops = [recommended_crop]
                    else:
                        recommended_crops = recommended_data.get('recommended_crops', [])
                        if isinstance(recommended_crops, str):
                            crops = [recommended_crops]
                        elif isinstance(recommended_crops, list):
                            crops = recommended_crops
                        else:
                            crops = []
                
                # Format confidence - FIXED
                confidence_value = 'N/A'
                if isinstance(recommended_data, dict):
                    confidence = recommended_data.get('confidence')
                    if confidence is not None:
                        if isinstance(confidence, (int, float)):
                            confidence_value = f"{confidence * 100:.0f}%"
                        elif isinstance(confidence, str):
                            # Handle string confidence values
                            try:
                                confidence_float = float(confidence.strip('%'))
                                confidence_value = f"{confidence_float:.0f}%"
                            except:
                                confidence_value = confidence
                
                # Format yield and profit
                estimated_yield = recommended_data.get('estimated_yield', 'N/A')
                estimated_profit = recommended_data.get('estimated_profit', 'N/A')
                
                # Format sustainability score
                sustainability = recommended_data.get('sustainability_score', 'N/A')
                
                recommendation_item = {
                    'id': rec.id,
                    'date': rec.created_at.strftime('%Y-%m-%d'),
                    'crops': crops,
                    'yield': estimated_yield,
                    'profit': estimated_profit,
                    'confidence': confidence_value,
                    'parameters': {
                        'n': input_data.get('n', 0),
                        'p': input_data.get('p', 0),
                        'k': input_data.get('k', 0),
                        'ph': input_data.get('ph', 0),
                        'temperature': input_data.get('temperature', 0),
                        'humidity': input_data.get('humidity', 0),
                        'rainfall': input_data.get('rainfall', 0)
                    },
                    'sustainability': sustainability,
                    'created_at': rec.created_at.isoformat()
                }
                result.append(recommendation_item)
            except Exception as e:
                print(f"Error processing recommendation {rec.id}: {e}")
                continue
        
        # Apply search filter
        if search_term:
            result = [item for item in result 
                     if any(search_term.lower() in crop.lower() 
                           for crop in item.get('crops', []))]
        
        # Apply sorting
        if sort_by == 'confidence':
            result.sort(key=lambda x: float(x.get('confidence', '0').rstrip('%')), 
                       reverse=(sort_order == 'desc'))
        elif sort_by == 'yield':
            result.sort(key=lambda x: float(x.get('yield', '0').split()[0]), 
                       reverse=(sort_order == 'desc'))
        elif sort_by == 'profit':
            result.sort(key=lambda x: float(x.get('profit', '0').replace('₹', '').replace(',', '')), 
                       reverse=(sort_order == 'desc'))
        
        return jsonify({
            'success': True,
            'recommendations': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching recommendations: {str(e)}'
        }), 500

@history_bp.route('/pest-reports', methods=['GET'])
@jwt_required()
def get_pest_reports():
    try:
        farmer_id = get_jwt_identity()
        
        # Get query parameters
        search_term = request.args.get('search', '')
        date_filter = request.args.get('date_filter', 'all')
        sort_by = request.args.get('sort_by', 'date')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Base query
        query = PestReport.query.filter_by(farmer_id=farmer_id)
        
        # Apply date filter
        if date_filter != 'all':
            now = datetime.now()
            if date_filter == 'week':
                start_date = now - timedelta(days=7)
            elif date_filter == 'month':
                start_date = now - timedelta(days=30)
            elif date_filter == 'quarter':
                start_date = now - timedelta(days=90)
            else:
                start_date = now - timedelta(days=365)
            
            query = query.filter(PestReport.created_at >= start_date)
        
        # Execute query
        pest_reports = query.order_by(PestReport.created_at.desc()).all()
        
        # Transform data for frontend
        result = []
        for report in pest_reports:
            try:
                advisory_data = report.advisory_json or {}
                
                # Format pest name - remove underscores and make it readable
                pest_name = report.predicted_label or 'Unknown Pest'
                if pest_name:
                    pest_name = pest_name.replace('_', ' ').replace('___', ' - ').title()
                
                # Calculate confidence percentage (multiply by 100) - FIXED
                confidence_percentage = 'N/A'
                if report.confidence is not None:
                    confidence_percentage = f"{report.confidence * 100:.0f}%"
                
                # Extract treatment from advisory_json
                treatment = 'No treatment advice available'
                if isinstance(advisory_data, dict):
                    # Try to get organic treatment first
                    treatment = advisory_data.get('organic', 'No treatment advice available')
                    # If no organic treatment, try to get any treatment information
                    if treatment == 'No treatment advice available':
                        for key, value in advisory_data.items():
                            if 'treatment' in key.lower() or 'advice' in key.lower():
                                treatment = value
                                break
                
                # Handle image path
                images = []
                if report.image_path:
                    # Extract just the filename from the mixed path format
                    clean_filename = report.image_path.replace('\\', '/').split('/')[-1]
                    image_url = f"/api/uploads/{clean_filename}"
                    images = [image_url]
                
                pest_item = {
                    'id': report.id,
                    'date': report.created_at.strftime('%Y-%m-%d'),
                    'pest': pest_name,
                    'confidence': confidence_percentage,
                    'treatment': treatment,
                    'severity': advisory_data.get('severity', 'Medium'),
                    'affectedCrop': advisory_data.get('affected_crop', 'Multiple crops'),
                    'status': advisory_data.get('status', 'Monitoring'),
                    'images': images,
                    'created_at': report.created_at.isoformat()
                }
                result.append(pest_item)
            except Exception as e:
                print(f"Error processing pest report {report.id}: {e}")
                continue
        
        # Apply search filter
        if search_term:
            result = [item for item in result 
                     if search_term.lower() in item.get('pest', '').lower()]
        
        # Apply sorting
        if sort_by == 'confidence':
            result.sort(key=lambda x: float(x.get('confidence', '0').rstrip('%')), 
                       reverse=(sort_order == 'desc'))
        elif sort_by == 'severity':
            severity_order = {'High': 3, 'Medium': 2, 'Low': 1}
            result.sort(key=lambda x: severity_order.get(x.get('severity', 'Medium'), 1), 
                       reverse=(sort_order == 'desc'))
        
        return jsonify({
            'success': True,
            'pest_reports': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching pest reports: {str(e)}'
        }), 500

@history_bp.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    """Serve uploaded pest images"""
    try:
        # Clean the filename
        clean_filename = filename.replace('\\', '/').split('/')[-1]
        
        # Try multiple possible locations
        possible_paths = [
            os.path.join(os.getcwd(), 'uploads', clean_filename),
            os.path.join('.', 'uploads', clean_filename),
            os.path.join('uploads', clean_filename),
        ]
        
        # Try each possible path
        for file_path in possible_paths:
            if os.path.exists(file_path):
                directory = os.path.dirname(file_path) or '.'
                file_name = os.path.basename(file_path)
                return send_from_directory(directory, file_name)
        
        return jsonify({'error': 'File not found'}), 404
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@history_bp.route('/recommendations/<int:recommendation_id>', methods=['DELETE'])
@jwt_required()
def delete_recommendation(recommendation_id):
    try:
        farmer_id = get_jwt_identity()
        
        recommendation = Recommendation.query.filter_by(
            id=recommendation_id, 
            farmer_id=farmer_id
        ).first()
        
        if not recommendation:
            return jsonify({
                'success': False,
                'message': 'Recommendation not found'
            }), 404
        
        db.session.delete(recommendation)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Recommendation deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error deleting recommendation: {str(e)}'
        }), 500

@history_bp.route('/pest-reports/<int:pest_report_id>', methods=['DELETE'])
@jwt_required()
def delete_pest_report(pest_report_id):
    try:
        farmer_id = get_jwt_identity()
        
        pest_report = PestReport.query.filter_by(
            id=pest_report_id, 
            farmer_id=farmer_id
        ).first()
        
        if not pest_report:
            return jsonify({
                'success': False,
                'message': 'Pest report not found'
            }), 404
        
        # Optional: Delete associated image file
        if pest_report.image_path and os.path.exists(pest_report.image_path):
            try:
                os.remove(pest_report.image_path)
            except Exception as e:
                print(f"Error deleting image file: {e}")
        
        db.session.delete(pest_report)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Pest report deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error deleting pest report: {str(e)}'
        }), 500

@history_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_history_stats():
    try:
        farmer_id = get_jwt_identity()
        
        # Get counts
        total_recommendations = Recommendation.query.filter_by(farmer_id=farmer_id).count()
        total_pest_reports = PestReport.query.filter_by(farmer_id=farmer_id).count()
        
        # Calculate average confidence for recommendations - FIXED
        rec_confidence_sum = 0
        rec_count = 0
        recommendations = Recommendation.query.filter_by(farmer_id=farmer_id).all()
        
        for rec in recommendations:
            try:
                if rec.recommended_json and isinstance(rec.recommended_json, dict):
                    confidence = rec.recommended_json.get('confidence')
                    if confidence is not None:
                        if isinstance(confidence, (int, float)):
                            rec_confidence_sum += confidence * 100  # Convert to percentage
                            rec_count += 1
                        elif isinstance(confidence, str):
                            # Handle string confidence like "77%"
                            try:
                                confidence_float = float(confidence.strip('%'))
                                rec_confidence_sum += confidence_float
                                rec_count += 1
                            except:
                                continue
            except:
                continue
        
        avg_rec_confidence = (rec_confidence_sum / rec_count) if rec_count > 0 else 0
        
        # Calculate average confidence for pest reports - FIXED
        pest_confidence_sum = 0
        pest_count = 0
        pest_reports = PestReport.query.filter_by(farmer_id=farmer_id).all()
        
        for report in pest_reports:
            if report.confidence is not None:
                pest_confidence_sum += report.confidence * 100  # Convert to percentage
                pest_count += 1
        
        avg_pest_confidence = (pest_confidence_sum / pest_count) if pest_count > 0 else 0
        
        return jsonify({
            'success': True,
            'stats': {
                'total_recommendations': total_recommendations,
                'total_pest_reports': total_pest_reports,
                'avg_recommendation_confidence': f"{avg_rec_confidence:.0f}%",
                'avg_pest_confidence': f"{avg_pest_confidence:.0f}%"
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching stats: {str(e)}'
        }), 500