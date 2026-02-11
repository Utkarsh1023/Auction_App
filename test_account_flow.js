const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAccountFlow() {
  console.log('=== Testing Account Flow for "Test Test" ===\n');

  try {
    // 1. Register the user
    console.log('1. Registering user "Test Test"...');
    const registerResponse = await axios.post(`${BASE_URL}/register`, {
      name: 'Test Test',
      email: 'test@test.com',
      password: 'password123'
    });
    console.log('Registration Response:', registerResponse.data);

    // 2. Login
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'test@test.com',
      password: 'password123'
    });
    console.log('Login Response:', loginResponse.data);
    const userId = loginResponse.data.user.id;

    // 3. Deactivate account
    console.log('\n3. Deactivating account...');
    const deactivateResponse = await axios.put(`${BASE_URL}/deactivate/${userId}`);
    console.log('Deactivate Response:', deactivateResponse.data);

    // 4. Try to login again (should fail)
    console.log('\n4. Attempting login after deactivation...');
    try {
      const loginAfterDeactivate = await axios.post(`${BASE_URL}/login`, {
        email: 'test@test.com',
        password: 'password123'
      });
      console.log('Unexpected: Login succeeded:', loginAfterDeactivate.data);
    } catch (error) {
      console.log('Expected: Login failed:', error.response.data);
    }

    // 5. Reactivate account
    console.log('\n5. Reactivating account...');
    const reactivateResponse = await axios.put(`${BASE_URL}/reactivate/${userId}`);
    console.log('Reactivate Response:', reactivateResponse.data);

    // 6. Login again (should succeed)
    console.log('\n6. Logging in after reactivation...');
    const loginAfterReactivate = await axios.post(`${BASE_URL}/login`, {
      email: 'test@test.com',
      password: 'password123'
    });
    console.log('Login Response:', loginAfterReactivate.data);

    // 7. Delete account
    console.log('\n7. Deleting account...');
    const deleteResponse = await axios.delete(`${BASE_URL}/delete/${userId}`);
    console.log('Delete Response:', deleteResponse.data);

    // 8. Try to login again (should fail)
    console.log('\n8. Attempting login after deletion...');
    try {
      const loginAfterDelete = await axios.post(`${BASE_URL}/login`, {
        email: 'test@test.com',
        password: 'password123'
      });
      console.log('Unexpected: Login succeeded:', loginAfterDelete.data);
    } catch (error) {
      console.log('Expected: Login failed:', error.response.data);
    }

  } catch (error) {
    console.error('Error during test:', error.response ? error.response.data : error.message);
  }
}

testAccountFlow();
