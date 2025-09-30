import json

def test_get_users(test_client, init_database):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/users' endpoint is requested (GET)
    THEN check that the response is valid
    """
    response = test_client.get('/api/users')
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert len(response_data) > 0
    assert response_data[0]['username'] == 'testuser'

def test_get_user(test_client, init_database):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/users/1' endpoint is requested (GET)
    THEN check that the response is valid
    """
    response = test_client.get('/api/users/1')
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert response_data['username'] == 'testuser'

def test_create_user(test_client, init_database):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/users' endpoint is posted to (POST)
    THEN check that a new user is created
    """
    data = {'username': 'newuser', 'email': 'new@example.com', 'password': 'newpassword'}
    response = test_client.post('/api/users', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 201
    response_data = json.loads(response.data)
    assert response_data['message'] == 'User created successfully'

def test_update_user(test_client, init_database):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/users/1' endpoint is updated (PUT)
    THEN check that the user is updated
    """
    data = {'username': 'updateduser'}
    response = test_client.put('/api/users/1', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert response_data['message'] == 'User updated successfully'

def test_delete_user(test_client, init_database):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/users/1' endpoint is deleted (DELETE)
    THEN check that the user is deleted
    """
    response = test_client.delete('/api/users/1')
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert response_data['message'] == 'User deleted successfully''
