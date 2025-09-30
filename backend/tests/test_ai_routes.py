import json

def test_get_ai_conversations(test_client, init_database):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/ai/conversations' endpoint is requested (GET)
    THEN check that the response is valid
    """
    response = test_client.get('/api/ai/conversations')
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert isinstance(response_data, list)

def test_create_ai_conversation(test_client, init_database):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/ai/conversations' endpoint is posted to (POST)
    THEN check that a new AI conversation is created
    """
    data = {'user_id': 1, 'conversation': 'Hello AI'}
    response = test_client.post('/api/ai/conversations', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 201
    response_data = json.loads(response.data)
    assert response_data['message'] == 'AI conversation created successfully'

