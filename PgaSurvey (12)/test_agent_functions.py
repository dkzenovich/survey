import json
import logging
from agent import agent_summary_and_recommendations, agent_recommended_tasks

logging.basicConfig(level=logging.DEBUG)

def test_agent_summary_and_recommendations():
    sample_data = {
        "questions": [
            {
                "department": "Вопросы по проблеме с чистотой и санитарным состоянием помещений",
                "questions": [
                    "Как часто проводится уборка помещений?",
                    "Какие средства и инвентарь используются для уборки?",
                    "Обучены ли сотрудники, ответственные за уборку, современным методам и технологиям клининга?",
                    "Существует ли регулярный контроль качества уборки?",
                    "Соблюдаются ли нормы и требования санитарно-эпидемиологического законодательства?"
                ]
            }
        ],
        "answers": [
            "Уборка проводится один раз в день, в конце рабочего дня.",
            "Используются обычные бытовые чистящие средства и инвентарь, приобретаемые в местном магазине.",
            "Специального обучения не проводилось, сотрудники работают по старинке.",
            "Контроль качества уборки проводится нерегулярно, только при возникновении жалоб.",
            "Нормы соблюдаются частично, полного понимания всех требований нет."
        ]
    }

    try:
        logging.info("Starting test_agent_summary_and_recommendations")
        result = agent_summary_and_recommendations(sample_data)
        logging.info(f"agent_summary_and_recommendations result: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        assert "summary" in result, "Result is missing 'summary' key"
        assert "recommendations" in result, "Result is missing 'recommendations' key"
        assert isinstance(result["recommendations"], list), "'recommendations' should be a list"
        
        print("Test passed for agent_summary_and_recommendations")
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding error: {e}")
        print(f"Test failed for agent_summary_and_recommendations: JSON decoding error")
    except AssertionError as e:
        logging.error(f"Assertion error: {e}")
        print(f"Test failed for agent_summary_and_recommendations: {e}")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        print(f"Test failed for agent_summary_and_recommendations: Unexpected error")

def test_agent_recommended_tasks():
    sample_data = {
        "summary": "Выявлены проблемы с чистотой и санитарным состоянием помещений. Уборка проводится нерегулярно, используются неподходящие средства, персонал не обучен современным методам уборки, контроль качества отсутствует, а соблюдение санитарных норм неполное.",
        "recommendations": [
            "Разработать график ежедневной уборки помещений",
            "Закупить профессиональные чистящие средства и оборудование",
            "Организовать обучение персонала современным методам клининга",
            "Внедрить систему регулярного контроля качества уборки",
            "Провести аудит соблюдения санитарно-эпидемиологических требований"
        ]
    }

    try:
        logging.info("Starting test_agent_recommended_tasks")
        result = agent_recommended_tasks(sample_data)
        logging.info(f"agent_recommended_tasks result: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        assert "tasks" in result, "Result is missing 'tasks' key"
        assert isinstance(result["tasks"], list), "'tasks' should be a list"
        
        print("Test passed for agent_recommended_tasks")
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding error: {e}")
        print(f"Test failed for agent_recommended_tasks: JSON decoding error")
    except AssertionError as e:
        logging.error(f"Assertion error: {e}")
        print(f"Test failed for agent_recommended_tasks: {e}")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        print(f"Test failed for agent_recommended_tasks: Unexpected error")

if __name__ == "__main__":
    test_agent_summary_and_recommendations()
    test_agent_recommended_tasks()
