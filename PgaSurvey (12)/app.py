import logging
from flask import Flask, render_template, request, jsonify
from agent import agent, agent_problemes, agent_otdel, agent_quest, agent_summary_and_recommendations, agent_recommended_tasks, agent_adgenda
import json

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/survey')
def survey():
    return render_template('survey.html')

@app.route('/process_query', methods=['POST'])
def process_query():
    data = request.json
    query = data.get('query')
    logging.debug(f"Received query: {query}")
    logging.debug("Calling agent function")
    result = agent(query)
    logging.debug(f"Agent function returned: {result}")
    return json.dumps(result)

@app.route('/continue_analysis', methods=['POST'])
def continue_analysis():
    try:
        data = request.json
        aspects = data.get('aspects')
        logging.debug(f"Received aspects for continued analysis: {aspects}")
        if not aspects:
            logging.error("No aspects received")
            return jsonify({"error": "No aspects received"}), 400

        logging.debug("Calling agent_problemes function")
        problems = agent_problemes(aspects)
        logging.debug(f"Agent_problemes function returned: {problems}")

        logging.debug(f"Calling agent_otdel function {aspects}")
        relevant_departments = agent_otdel(aspects)
        logging.debug(f"Agent_otdel function returned: {relevant_departments}")

        logging.debug(f"Calling agent_quest function {aspects}")
        interview_questions = agent_quest(aspects)
        logging.debug(f"Agent_quest function returned: {interview_questions}")

        result = {
            "problems": problems,
            "relevant_departments": relevant_departments,
            "interview_questions": interview_questions
        }
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error in continue_analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/submit-survey', methods=['POST'])
def submit_survey():
    try:
        data = request.json
        logging.debug(f"Received survey data: {data}")
        return jsonify({
            "message": "Survey data received successfully",
            "data": data
        }), 200
    except Exception as e:
        logging.error(f"Error in submit_survey: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get_summary_and_recommendations', methods=['POST'])
def get_summary_and_recommendations():
    try:
        data = request.json
        collected_data = data.get('collected_data')
        if not collected_data:
            return jsonify({"error": "No collected data received"}), 400

        logging.debug(f"Received collected data: {collected_data}")

        result = agent_summary_and_recommendations(collected_data)
        logging.debug(f"Summary and recommendations result: {result}")

        if not isinstance(result, dict) or 'summary' not in result or 'recommendations' not in result:
            logging.error(f"Invalid result structure: {result}")
            return jsonify({"error": "Invalid result structure"}), 500

        if not isinstance(result['summary'], str) or not isinstance(result['recommendations'], list):
            logging.error(f"Invalid data types in result: {result}")
            return jsonify({"error": "Invalid data types in result"}), 500

        return jsonify(result)
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding error: {str(e)}")
        return jsonify({"error": "Invalid JSON in request"}), 400
    except Exception as e:
        logging.error(f"Error in get_summary_and_recommendations: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route('/get_recommended_tasks', methods=['POST'])
def get_recommended_tasks():
    try:
        data = request.json
        summary_and_recommendations = data.get('summary_and_recommendations')
        if not summary_and_recommendations:
            return jsonify({"error": "No summary and recommendations received"}), 400

        logging.debug(f"Received summary and recommendations: {summary_and_recommendations}")
        result = agent_recommended_tasks(summary_and_recommendations)
        logging.debug(f"Recommended tasks result: {result}")

        if not isinstance(result, dict) or 'tasks' not in result or not isinstance(result['tasks'], list):
            logging.error(f"Invalid result structure: {result}")
            return jsonify({"error": "Invalid result structure"}), 500

        return jsonify(result)
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding error: {str(e)}")
        return jsonify({"error": "Invalid JSON in request"}), 400
    except Exception as e:
        logging.error(f"Error in get_recommended_tasks: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route('/generate_agenda', methods=['POST'])
def generate_agenda():
    try:
        data = request.json
        logging.debug(f"Received data for agenda generation: {data}")
        
        summary = data.get('summary')
        recommendations = data.get('recommendations')
        tasks = data.get('tasks')

        if not summary or not recommendations or not tasks:
            return jsonify({"error": "Missing required data"}), 400

        logging.debug(f"Calling agent_adgenda with summary: {summary}, recommendations: {recommendations}, tasks: {tasks}")
        result = agent_adgenda(summary, recommendations, tasks)
        logging.debug(f"Generated agenda: {result}")

        return jsonify(result)
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding error: {str(e)}")
        return jsonify({"error": "Invalid JSON in request"}), 400
    except Exception as e:
        logging.error(f"Error in generate_agenda: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)