const api_url = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', async () => {
    await populateUserData();
});


async function populateUserData() {
    try {
        const response = await axios.get(`${api_url}/users/api/userinfo/`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        const user = response.data;

        document.getElementById('username').value = user.username;
        document.getElementById('firstname').value = user.first_name;
        document.getElementById('secondname').value = user.last_name;
        document.getElementById('password').value = ''; // Keep password blank

        // Store user ID in a hidden field or a global variable
        document.getElementById('userId').value = user.id;
        initialPassword = user.password; // Store the initial password
        // console.log('User ID:', user.id); // Log the user ID to ensure it's correct
    } catch (error) {
        // console.error("Error fetching user data: ", error);
    }
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await updateUserData();
});

async function updateUserData() {
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    const userData = {
        username: document.getElementById('username').value,
        first_name: document.getElementById('firstname').value,
        last_name: document.getElementById('secondname').value,
    };

    // Only include password if it's not blank
    if (password) {
        userData.password = password;
    }

    try {
        const url = `${api_url}/users/userlist/${userId}`;
        // console.log('PUT URL:', url); // Log the URL to verify it's correct
        const response = await axios.patch(url, userData, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        alert('User data updated successfully!');
    } catch (error) {
        // console.error("Error updating user data: ", error);
    }
}

document.getElementById('logoutBtn').addEventListener('click', async (event) => {
    await logOut();
});

async function logOut() {
    try {
        const response = await axios.post(`${api_url}/api/logout/`, {
            refresh_token: localStorage.getItem('refresh_token')
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = "../../index.html";
    } catch (error) {
        // console.error("logout error: ", error);
    }
}

async function refreshAccessToken() {
    const refresh_token = localStorage.getItem('refresh_token');

    try {
        const response = await axios.post(`${api_url}/api/token/refresh/`, {
            refresh: refresh_token
        });

        if (response.status === 200) {
            const new_access_token = response.data.access;
            localStorage.setItem('access_token', new_access_token);
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        window.location.href = "../index.html";
    }
}

function toggleEditable(id) {
    var inputField = document.getElementById(id);
    if (inputField.readOnly) {
        inputField.readOnly = false;
        inputField.style.backgroundColor = "#fff";
        inputField.style.color = "#163b6d";
    } else {
        inputField.readOnly = true;
        inputField.style.backgroundColor = "#e9e9e9";
        inputField.style.color = "#555";
    }
}
