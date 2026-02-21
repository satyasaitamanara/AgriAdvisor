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
                
                # Parse if string
                if isinstance(input_data, str):
                    try:
                        input_data = json.loads(input_data)
                    except:
                        input_data = {}
                
                if isinstance(recommended_data, str):
                    try:
                        recommended_data = json.loads(recommended_data)
                    except:
                        recommended_data = {}
                
                # Extract crop names - FIXED
                crops = []
                
                # Check for recommended_crop field (our current format)
                recommended_crop = recommended_data.get('recommended_crop')
                if recommended_crop:
                    crops = [recommended_crop]
                
                # Check for top_crops field (our new format with confidence)
                top_crops = recommended_data.get('top_crops', [])
                if top_crops and isinstance(top_crops, list):
                    crops = [crop.get('crop') for crop in top_crops if crop.get('crop')]
                
                # If still empty, try other possible fields
                if not crops:
                    recommended_crops = recommended_data.get('recommended_crops', [])
                    if isinstance(recommended_crops, str):
                        crops = [recommended_crops]
                    elif isinstance(recommended_crops, list):
                        crops = recommended_crops
                
                # Format confidence - FIXED
                confidence_value = 'N/A'
                
                # Try confidence_percent first (our new format)
                confidence_percent = recommended_data.get('confidence_percent')
                if confidence_percent is not None:
                    if isinstance(confidence_percent, (int, float)):
                        confidence_value = f"{confidence_percent:.0f}%"
                    elif isinstance(confidence_percent, str):
                        confidence_value = confidence_percent if confidence_percent.endswith('%') else f"{confidence_percent}%"
                else:
                    # Try confidence field (older format)
                    confidence = recommended_data.get('confidence')
                    if confidence is not None:
                        if isinstance(confidence, (int, float)):
                            confidence_value = f"{confidence * 100:.0f}%"
                        elif isinstance(confidence, str):
                            try:
                                confidence_float = float(confidence.strip('%'))
                                confidence_value = f"{confidence_float:.0f}%"
                            except:
                                confidence_value = confidence
                
                # Format yield and profit - FIXED
                estimated_yield = 'N/A'
                yield_analysis = recommended_data.get('yield_analysis', {})
                if yield_analysis:
                    yield_val = yield_analysis.get('estimated_yield')
                    if yield_val is not None:
                        yield_unit = yield_analysis.get('yield_unit', 'tons/acre')
                        estimated_yield = f"{yield_val} {yield_unit}"
                
                estimated_profit = 'N/A'
                if yield_analysis:
                    profit_val = yield_analysis.get('estimated_profit')
                    if profit_val is not None:
                        profit_currency = yield_analysis.get('profit_currency', '₹')
                        # Format with commas for thousands
                        try:
                            profit_formatted = f"{float(profit_val):,.0f}"
                            estimated_profit = f"{profit_currency}{profit_formatted}"
                        except:
                            estimated_profit = f"{profit_currency}{profit_val}"
                
                # Format sustainability score - FIXED
                sustainability = 'N/A'
                sustainability_data = recommended_data.get('sustainability', {})
                if sustainability_data:
                    overall_score = sustainability_data.get('overall')
                    if overall_score is not None:
                        sustainability = f"{overall_score}/100"
                
                # Get top crop for display
                primary_crop = crops[0] if crops else recommended_crop or 'Unknown'
                
                recommendation_item = {
                    'id': rec.id,
                    'date': rec.created_at.strftime('%Y-%m-%d %H:%M') if rec.created_at else 'Unknown',
                    'crops': crops,
                    'primary_crop': primary_crop,
                    'yield': estimated_yield,
                    'profit': estimated_profit,
                    'confidence': confidence_value,
                    'parameters': {
                        'n': input_data.get('N', input_data.get('n', 0)),
                        'p': input_data.get('P', input_data.get('p', 0)),
                        'k': input_data.get('K', input_data.get('k', 0)),
                        'ph': input_data.get('ph', 0),
                        'temperature': input_data.get('temperature', 0),
                        'humidity': input_data.get('humidity', 0),
                        'rainfall': input_data.get('rainfall', 0)
                    },
                    'sustainability': sustainability,
                    'created_at': rec.created_at.isoformat() if rec.created_at else None
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
            result.sort(key=lambda x: float(x.get('confidence', '0').rstrip('%') or '0'), 
                       reverse=(sort_order == 'desc'))
        elif sort_by == 'yield':
            result.sort(key=lambda x: float(str(x.get('yield', '0')).split()[0] or '0'), 
                       reverse=(sort_order == 'desc'))
        elif sort_by == 'profit':
            result.sort(key=lambda x: float(str(x.get('profit', '0')).replace('₹', '').replace(',', '') or '0'), 
                       reverse=(sort_order == 'desc'))
        
        return jsonify({
            'success': True,
            'recommendations': result
        }), 200
        
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
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
                
                if isinstance(advisory_data, str):
                    try:
                        advisory_data = json.loads(advisory_data)
                    except:
                        advisory_data = {}
                
                # Format pest name - remove underscores and make it readable
                pest_name = report.predicted_label or 'Unknown Pest'
                if pest_name:
                    pest_name = pest_name.replace('_', ' ').replace('___', ' - ').title()
                
                # Calculate confidence percentage - FIXED
                confidence_percentage = 'N/A'
                if report.confidence is not None:
                    confidence_percentage = f"{report.confidence * 100:.0f}%"
                
                # Extract treatment from advisory_json
                treatment = 'No treatment advice available'
                if isinstance(advisory_data, dict):
                    # Try to get organic treatment first
                    treatment = advisory_data.get('organic', '')
                    if not treatment:
                        treatment = advisory_data.get('treatment', '')
                    if not treatment:
                        treatment = advisory_data.get('advice', '')
                    if not treatment:
                        treatment = 'No treatment advice available'
                
                # Handle image path - FIXED for 404 errors
                images = []
                if report.image_path:
                    # Extract just the filename
                    if isinstance(report.image_path, str):
                        # Clean the path
                        clean_filename = report.image_path.replace('\\', '/').split('/')[-1]
                        # URL encode the filename to handle special characters
                        from urllib.parse import quote
                        encoded_filename = quote(clean_filename)
                        image_url = f"/api/history/uploads/{encoded_filename}"
                        images = [image_url]
                
                pest_item = {
                    'id': report.id,
                    'date': report.created_at.strftime('%Y-%m-%d %H:%M') if report.created_at else 'Unknown',
                    'pest': pest_name,
                    'confidence': confidence_percentage,
                    'treatment': treatment,
                    'severity': advisory_data.get('severity', 'Medium'),
                    'affectedCrop': advisory_data.get('affected_crop', 'Unknown'),
                    'status': advisory_data.get('status', 'Pending'),
                    'images': images,
                    'created_at': report.created_at.isoformat() if report.created_at else None
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
            result.sort(key=lambda x: float(x.get('confidence', '0').rstrip('%') or '0'), 
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
        print(f"Error in get_pest_reports: {e}")
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
        
        # Define possible upload directories
        possible_dirs = [
            os.path.join(os.getcwd(), 'uploads'),
            os.path.join(os.path.dirname(os.getcwd()), 'uploads'),
            os.path.join(os.path.dirname(os.path.dirname(os.getcwd())), 'uploads'),
            'uploads',
            '.'
        ]
        
        # Try to find the file in possible directories
        for directory in possible_dirs:
            file_path = os.path.join(directory, clean_filename)
            if os.path.exists(file_path):
                # Ensure directory exists for send_from_directory
                if os.path.isdir(directory):
                    return send_from_directory(directory, clean_filename)
                else:
                    # If directory doesn't exist, send file directly
                    return send_file(file_path)
        
        # If file not found, log and return 404
        print(f"File not found: {clean_filename} in any of {possible_dirs}")
        return jsonify({'error': 'File not found'}), 404
        
    except Exception as e:
        print(f"Error serving file {filename}: {e}")
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
                recommended_data = rec.recommended_json or {}
                
                # Parse if string
                if isinstance(recommended_data, str):
                    try:
                        recommended_data = json.loads(recommended_data)
                    except:
                        recommended_data = {}
                
                # Try confidence_percent first
                confidence = recommended_data.get('confidence_percent')
                if confidence is not None:
                    if isinstance(confidence, (int, float)):
                        rec_confidence_sum += float(confidence)
                        rec_count += 1
                else:
                    # Try confidence field
                    confidence = recommended_data.get('confidence')
                    if confidence is not None:
                        if isinstance(confidence, (int, float)):
                            rec_confidence_sum += confidence * 100
                            rec_count += 1
                        elif isinstance(confidence, str):
                            try:
                                confidence_float = float(confidence.strip('%'))
                                rec_confidence_sum += confidence_float
                                rec_count += 1
                            except:
                                continue
            except Exception as e:
                print(f"Error processing stats for recommendation {rec.id}: {e}")
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
                'avg_recommendation_confidence': f"{avg_rec_confidence:.0f}%" if rec_count > 0 else "N/A",
                'avg_pest_confidence': f"{avg_pest_confidence:.0f}%" if pest_count > 0 else "N/A"
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_history_stats: {e}")
        return jsonify({
            'success': False,
            'message': f'Error fetching stats: {str(e)}'
        }), 500