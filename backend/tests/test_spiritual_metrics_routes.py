import json

def test_get_spiritual_metrics(test_client, init_database):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/spiritual-metrics' endpoint is requested (GET)
    THEN check that the response is valid
    """
    response = test_client.get('/api/spiritual-metrics')
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert isinstance(response_data, list)

def test_create_spiritual_metric(test_client, init_database):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/spiritual-metrics' endpoint is posted to (POST)
    THEN check that a new spiritual metric is created
    """
    data = {'name': 'New Metric', 'value': 10, 'user_id': 1}
    response = test_client.post('/api/spiritual-metrics', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 201
    response_data = json.loads(response.data)
    assert response_data['message'] == 'Spiritual metric created successfully'

