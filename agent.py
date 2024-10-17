import json
import logging
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from typing import List, Dict, Any

ANTHROPIC_API_KEY = "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"
llm_s = ChatAnthropic(api_key=ANTHROPIC_API_KEY, model_name='claude-3-haiku-20240307')

logging.basicConfig(level=logging.DEBUG)

def agent(user_input) -> Dict[str, Any]:
    agent_prompt = ChatPromptTemplate.from_messages([(
        "system",
        """Вы - эксперт по анализу бизнес-проблем. Ваша задача - внимательно изучить запрос пользователя и выделить основные проблемы, которые необходимо решить.
Следуйте этим инструкциям:

Внимательно прочитайте предоставленный запрос.
Определите ключевые проблемы, упомянутые в тексте. Обратите особое внимание на:

Финансовые трудности
Операционные проблемы
Кадровые вопросы
Проблемы с клиентами или рынком
Логистические сложности
Любые другие значимые проблемы в бизнесе


Составьте список из 1-3 основных проблем, которые вы выявили.
Сформулируйте каждую проблему кратко и четко, используя 1 предложения.
Представьте список выявленных проблем в следующем формате валидного JSON:


        "problems": [
          "Проблема 1",
          "Проблема 2",
          "Проблема 3"
        ]

Ваш ответ должен содержать ТОЛЬКО ВАЛИДНЫЙ JSON, не должно быть ни чего кроме него.
Помните: ваша цель - выделить самые важные и актуальные проблемы, требующие решения. Избегайте повторений и слишком общих формулировок.
       """), ("human", "{user_input}")])
    agent_runnable = agent_prompt | llm_s
    result = agent_runnable.invoke({"user_input": user_input})
    return result.content

def agent_problemes(problemes):
    return problemes

def agent_otdel(problems: list) -> str:
    problems_str = "\n".join(f"- {problem}" for problem in problems)
    agent_otdel_prompt = ChatPromptTemplate.from_messages([(
        "system",
        """Вы - эксперт по анализу бизнес-проблем и организационной структуре компании. Ваша задача - определить отделы, в чьей зоне ответственности находятся предоставленные проблемы.

Инструкции:
1. Внимательно изучите предоставленные проблемы.
2. Определите один или несколько отделов, которые могут быть ответственны за решение каждой проблемы. 
В компании есть следующие отделы: Отдел Маркетинга, Отдел Разработки, Отдел Бухгалтерии, Отдел Финансов, Отдел АХЧ
3. Составьте список уникальных отделов, исключив повторения.
4. Представьте результат в виде списка отделов.

Ваш ответ должен содержать ТОЛЬКО названия отделов, без дополнительных комментариев или пояснений.
       """), ("human", "Проблемы:\n{problems}")])
    agent_otdel_runnable = agent_otdel_prompt | llm_s
    result = agent_otdel_runnable.invoke({"problems": problems_str})

    departments = [
        dept.strip() for dept in result.content.split('\n') if dept.strip()
    ]

    departments = [
        dept[2:] if dept.startswith("- ") else dept for dept in departments
    ]

    return json.dumps({"departments": departments}, ensure_ascii=False)

def agent_quest(problems: list) -> str:
    problems_str = "\n".join(f"- {problem}" for problem in problems)
    agent_quest_prompt = ChatPromptTemplate.from_messages([(
        "system",
        """Вы - эксперт по анализу бизнес-проблем. Ваша задача - составить набор вопросов для прояснения ситуации по заданным проблемам.
Следуйте этим инструкциям:

1. Внимательно изучите предоставленные проблемы.
2. Составьте список из 3-5 вопросов к сотруднику в чьей зоне ответственности находится проблема, для каждой проблемы.
3. Вопросы должны быть конкретными, четкими и направленными на выявление ключевых причин проблемы.
4. Представьте список вопросов в следующем формате валидного JSON:


"Вопросы по проблеме 1": [
  "Вопрос 1",
  "Вопрос 2",
  "Вопрос 3"
],
"Вопросы по проблеме 2": [
  "Вопрос 1",
  "Вопрос 2",
  "Вопрос 3"
],
"Вопросы по проблеме 3": [
  "Вопрос 1",
  "Вопрос 2",
  "Вопрос 3"
]


Ваш ответ должен содержать ТОЛЬКО ВАЛИДНЫЙ JSON, не должно быть ничего кроме него.
Помните: ваша цель - составить вопросы, которые помогут глубже разобраться в проблемах и найти эффективные решения.
       """), ("human", "Проблемы:\n{problems}")])
    agent_quest_runnable = agent_quest_prompt | llm_s
    result = agent_quest_runnable.invoke({"problems": problems_str})
    return result.content

def preprocess_collected_data(collected_data):
    processed_data = []
    answers = collected_data['answers']
    questions = collected_data['questions'][0]['questions']  # Предполагаем, что у нас только один набор вопросов

    for q, a in zip(questions, answers):
        processed_data.append({"question": q, "answer": a})

    return processed_data

def agent_summary_and_recommendations(collected_data):
    try:
        processed_data = preprocess_collected_data(collected_data)
        data = json.dumps(processed_data, ensure_ascii=False, indent=2)
        agent_summary_prompt = ChatPromptTemplate.from_messages([(
            "system",
            """Вы - эксперт по анализу бизнес-проблем. Ваша задача - проанализировать предоставленные данные и составить краткую сводку и рекомендации.

Входные данные(пары вопрос-ответ):
{data}

Следуйте этим инструкциям:
1. Внимательно изучите предоставленные данные, включая вопросы и ответы.
2. Составьте краткую сводку ситуации, основываясь на полученных ответах.
3. Разработайте 3-5 конкретных рекомендаций для решения выявленной проблемы.
4. Представьте результат в следующем формате валидного JSON:

{{"summary": "Краткая сводка ситуации...","recommendations": ["Рекомендация 1","Рекомендация 2","Рекомендация 3","Рекомендация 4","Рекомендация 5"]}}

Ваш ответ должен содержать ТОЛЬКО ВАЛИДНЫЙ JSON, не должно быть ничего кроме него.
Помните: ваша цель - предоставить четкую сводку ситуации и эффективные рекомендации для решения проблемы.
            """
        ), ("human", "{data}")])
        agent_summary_runnable = agent_summary_prompt | llm_s
        result = agent_summary_runnable.invoke({"data": data})
        
        parsed_result = json.loads(result.content)
        logging.debug(f"Parsed summary and recommendations: {parsed_result}")
        
        if not isinstance(parsed_result, dict) or 'summary' not in parsed_result or 'recommendations' not in parsed_result:
            raise ValueError("Invalid result structure")
        
        return parsed_result
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding error in agent_summary_and_recommendations: {e}")
        raise
    except Exception as e:
        logging.error(f"Error in agent_summary_and_recommendations: {e}")
        raise

def agent_recommended_tasks(summary_and_recommendations):
    try:
        agent_recommended_tasks_prompt = ChatPromptTemplate.from_messages([(
            "system",
            """Вы - эксперт по управлению проектами. Ваша задача - разработать список конкретных задач на основе предоставленной сводки и рекомендаций.

Входные данные:
{summary_and_recommendations}

Следуйте этим инструкциям:
1. Внимательно изучите предоставленную сводку и рекомендации.
2. Разработайте список из 3-5 конкретных, выполнимых задач, которые помогут реализовать данные рекомендации.
3. Представьте результат в следующем формате валидного JSON:

{{"tasks": ["Задача 1","Задача 2","Задача 3","Задача 4","Задача 5"]}}

Ваш ответ должен содержать ТОЛЬКО ВАЛИДНЫЙ JSON, не должно быть ничего кроме него.
Помните: задачи должны быть конкретными, измеримыми и направленными на решение выявленной проблемы.
            """
        ), ("human", "{summary_and_recommendations}")])
        agent_recommended_tasks_runnable = agent_recommended_tasks_prompt | llm_s
        result = agent_recommended_tasks_runnable.invoke(
            {"summary_and_recommendations": json.dumps(summary_and_recommendations, ensure_ascii=False)}
        )
        
        parsed_result = json.loads(result.content)
        logging.debug(f"Parsed recommended tasks: {parsed_result}")
        
        if not isinstance(parsed_result, dict) or 'tasks' not in parsed_result or not isinstance(parsed_result['tasks'], list):
            raise ValueError("Invalid result structure")
        
        return parsed_result
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding error in agent_recommended_tasks: {e}")
        raise
    except Exception as e:
        logging.error(f"Error in agent_recommended_tasks: {e}")
        raise

def agent_adgenda(summary, recommendations, tasks):
    try:
        logging.debug(f"agent_adgenda called with summary: {summary}")
        logging.debug(f"agent_adgenda called with recommendations: {recommendations}")
        logging.debug(f"agent_adgenda called with tasks: {tasks}")

        agent_adgenda_prompt = ChatPromptTemplate.from_messages([(
            "system",
            """Вы - эксперт по организации встреч. Ваша задача - разработать адженду (повестку дня) встречи на основе предоставленной информации.

Входные данные:
Краткая сводка по проблеме: {summary}
Конкретные рекомендации: {recommendations}
Список рекомендуемых задач: {tasks}

Следуйте этим инструкциям:
1. Внимательно изучите предоставленную информацию.
2. Разработайте структурированную адженду встречи, которая включает в себя обсуждение проблемы, рекомендаций и задач.
3. Представьте результат в следующем формате валидного JSON:

{{
    "agenda": [
        {{"topic": "Тема 1", "duration": "XX минут", "description": "Краткое описание"}},
        {{"topic": "Тема 2", "duration": "XX минут", "description": "Краткое описание"}},
        ...
    ]
}}

Ваш ответ должен содержать ТОЛЬКО ВАЛИДНЫЙ JSON, не должно быть ничего кроме него.
Помните: адженда должна быть структурированной, логичной и охватывать все предоставленные аспекты.
            """
        ), ("human", "Краткая сводка: {summary}\nРекомендации: {recommendations}\nЗадачи: {tasks}")])

        agent_adgenda_runnable = agent_adgenda_prompt | llm_s
        result = agent_adgenda_runnable.invoke({
            "summary": summary,
            "recommendations": json.dumps(recommendations, ensure_ascii=False),
            "tasks": json.dumps(tasks, ensure_ascii=False)
        })

        parsed_result = json.loads(result.content)
        logging.debug(f"Parsed agenda: {parsed_result}")

        if not isinstance(parsed_result, dict) or 'agenda' not in parsed_result or not isinstance(parsed_result['agenda'], list):
            raise ValueError("Invalid result structure")

        return parsed_result
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding error in agent_adgenda: {e}")
        raise
    except Exception as e:
        logging.error(f"Error in agent_adgenda: {e}")
        raise
