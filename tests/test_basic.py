def test_app_exists(test_app):
    """Check if the test app fixture works and is in testing mode."""
    assert test_app is not None
    assert test_app.config['TESTING'] is True
    assert 'sqlite:///:memory:' in test_app.config['SQLALCHEMY_DATABASE_URI']


def test_request_example(test_client):
    """Check if the test client works and can access the login page."""
    # Access the login page (adjust URL if your auth blueprint prefix changes)
    response = test_client.get('/auth/login')
    assert response.status_code == 200
    assert b'Log In' in response.data  # Check for content specific to the login page


# Add more basic tests here later, e.g., for index page redirect when not logged in
