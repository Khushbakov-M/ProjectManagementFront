
const users_url = 'https://projectmanagement-2s4q.onrender.com'

document.addEventListener('DOMContentLoaded', async function () {
    await refreshAccessToken()
    axios.get(`${users_url}/users/teamlist/`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
        .then(async function (response) {
            if (response.data.length > 0) {
                let data = response.data;
                // console.log(response.data);
                let html = '';
                data.forEach(item => {
                    html += `
                        <div class="card" data-id="${item.id}">  
                            <h2>Jamoa nomi: <span id="project_name">${item.title}</span></h2>
                            <div class="section">
                            <p>ID: <span id="id" class="highlight">${item.id}</span></p>
                            </div>
                            <div class="section">
                            <p>Jamoa sardori: <span id="team_captain" class="highlight">${item.user.first_name} ${item.user.last_name}</span></p>
                            </div> 
                            <div class="d-flex justify-content-end m-1">
                            <button onclick="viewDetails(${item.id})" class="btn btn-success">Batafsil</button>
                            </div> 
                            <div class="footer">
                            <p>Yaratilgan vaqt: <span id="created_at">${item.created_at}</span></p>
                            </div>
                        </div>
                    `;
                });

                document.getElementById("main").innerHTML = html;
            }
            else {
                document.getElementById("main").innerHTML = `
                    <div class="card">  
                    <div class="card-headers">
                        <h2 class="text-center">Jamoalar ro'yxati bo'sh</h2>
                    </div>
                    `;
            }
        })
        .catch(function (error) {
            // Handle error
            // console.log(error);
        });
})

document.getElementById('qoshish').addEventListener('click', async function (event) {
    const adding_team_id = 0
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const title = document.getElementById('title').value;

// Regular expression to allow only alphanumeric characters and spaces
const titleRegex = /^[a-zA-Z0-9\s]+$/;

if (!titleRegex.test(title)) {
    alert("Jamoa nomi bu turdagi belgilardan tashkil topmasligi kerak: @#$%^&*()!");
    return;  // Stop form submission if title is invalid
}


try {
    // Send POST request with Authorization header
    const response = await axios.post(`${users_url}/users/teamlist/create`, {
        username: username,
        password: password,
        title: title,
        first_name: firstName,
        last_name: lastName
    }, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    });

    // Success: Extract team ID
    adding_team_id = response.data.team.id;
    alert("Team ID: " + adding_team_id);
} catch (error) {
    // Error handling for 'Group already exists'
    if (error.response && error.response.status === 500) {
        window.location.reload();
    } else {
        alert('Bu nomdagi jamoa yoki foydalanuvchi(username) mavjud!');
    }
}
});

function viewDetails(team_id) {
    window.location.href = `details.html?id=${team_id}`;
}
document.getElementById('logoutBtn').addEventListener('click', async (event) => {
    await logOut();
});

async function logOut() {
    try {
        const s = await axios.post(`${users_url}/api/logout/`, {
            refresh_token: localStorage.getItem('refresh_token')
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        window.location.href = "../../index.html";
    } catch (error) {
        // console.error("logout error: ", error);
    }
}
async function refreshAccessToken() {
    try {
        const refresh_token = localStorage.getItem('refresh_token');
        axios.post(`${users_url}/api/token/refresh/`, {
            refresh: refresh_token
        })
            .then(function (response) {
                const new_access_token = response.data.access;
                localStorage.setItem('access_token', new_access_token);
            })
            .catch(function (error) {
                window.location.href = "../../index.html"
            });
    } catch (err) {
        // console.error(err);
    }
}
