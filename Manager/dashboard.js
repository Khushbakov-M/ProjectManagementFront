const api_url = 'http://localhost:8080';

document.getElementById('logoutBtn').addEventListener('click', (event) => {
    logOut();
});

function logOut() {
    try {
        axios.post(`${api_url}/api/logout/`, {
            refresh_token: localStorage.getItem('refresh_token')
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        }).then(res => {
            window.location.href = "../index.html";
        });
    } catch (error) {
        // console.error("logout error: ", error);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    await fillStats()
})


async function fillStats() {
    await refreshAccessToken()
    announcements_count.innerText = (await axios.get(`${api_url}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })).data.length

    const subteams = (await axios.get(`${api_url}/users/subteamlist/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })).data

    done_count.innerHTML = `<strong>${subteams.filter(item => item.status == 'accepted').length}</strong> Bajarilganlar`

    teams_count.innerText = (await axios.get(`${api_url}/users/teamlist`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })).data.length

    const dev_data = (await axios.get(`${api_url}/users/developer/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })).data;
    developers_count.innerText = dev_data.length
    frontend_count.innerHTML = `<strong>${dev_data.filter(item => item.position.toLowerCase() == 'frontend').length}</strong> FrontEndchi`
    backend_count.innerHTML = `<strong>${dev_data.filter(item => item.position.toLowerCase() == 'backend').length}</strong> BackEndchi`
    designer_count.innerHTML = `<strong>${dev_data.filter(item => item.position.toLowerCase() == 'designer').length}</strong> Dizayner`


    const employmentData = (await axios.get(`${api_url}/users/team-employment/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })).data;
    // console.log(employmentData);
    busy_count.innerHTML = `<strong>${employmentData.filter(item => item.status == 'busy').length}</strong> Band jamoalar`
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
