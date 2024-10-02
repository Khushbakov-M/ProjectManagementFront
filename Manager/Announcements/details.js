const urlParams = new URLSearchParams(window.location.search);
const ann_id = urlParams.get('id');
const api_url = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', async function () {
    await refreshAccessToken();
    fetchAnnouncement();
});

async function fetchAnnouncement() {
    try {
        const response = await axios.get(`${api_url}/${ann_id}`);
        const ann_info = response.data;
        displayAnnouncement(ann_info);
    } catch (error) {
        // console.error('Error fetching announcement:', error);
    }
}

function getFileName(url) {
    let parts = url.split('/');
    let fileName = parts[parts.length - 1];
    
    let nameParts = fileName.split('*');
    let mainName = nameParts[0]; 
    let extension = fileName.split('.').pop();

    return mainName + '.' + extension;
}

// Example usage
const file1Url = 'http://localhost:8080/media/documents/Python_6upLRCi.docx';
const fileName = getFileName(file1Url);


function displayAnnouncement(ann_info) {
    let html = `
        <div class="card" id="card-${ann_info.id}">
            <div class="card-header">
                <button class="btn btn-edit" id="open_update_btn" onclick="openUpdateModal(${ann_info.id})">
                    <i class="bi-pen"></i>
                </button>
                <button class="btn btn-delete" onclick="deleteAnnouncement(${ann_info.id})">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </div>
            <h2>Loyiha: <span class="highlight">${ann_info.project_name}</span></h2>
            <div class="section">
                <p><strong>ID:</strong> <span>${ann_info.id}</span></p>
                <p><strong>Buyurtmachi:</strong> <span>${ann_info.name_of_employer}</span></p>
            </div>
            <div class="section">
                <p><strong>Tashkilot Nomi:</strong> <span class="highlight">${ann_info.tashkilot_nomi}</span></p>
                <p><strong>Telefon Raqam:</strong> <span>${ann_info.phone}</span></p>
            </div>
            <div class="section">
            </div>
            <div class="section third-width">
                <p><strong>Topshirish kuni:</strong> <span>${ann_info.deadline}</span></p>
                <p><strong>Narx:</strong> <span>${ann_info.cost}</span></p>
                <p><strong>Bajarmoqda:</strong> <span>${ann_info.assigned_to_team}</span></p>
            </div>
            <div class="section full-width">
                <p><strong>Izoh:</strong> <span>${ann_info.description}</span></p>
            </div>`;
    
    if (ann_info.file1) {
        html += `
        <div class="section">
            <p><strong>Fayllar:</strong></p>
            <ul style="width: 100%; padding-left: 0; display: flex; flex-wrap: wrap;">
                <li>
                    <div class="document-card">
                        <a href="${ann_info.file1}" target="_blank">${getFileName(ann_info.file1)}</a>
                    </div>
                </li>`;
    }
    if (ann_info.file2) {
        html += `
                <li>
                    <div class="document-card">
                        <a href="${ann_info.file2}" target="_blank">${getFileName(ann_info.file2)}</a>
                    </div>
                </li>`;
    }
    if (ann_info.file3) {
        html += `
                <li>
                    <div class="document-card">
                        <a href="${ann_info.file3}" target="_blank">${getFileName(ann_info.file3)}</a>
                    </div>
                </li>`;
    }
    html += `
            </ul>
        </div>
    </div>`;

    document.getElementById('main').innerHTML = html;
}

async function openUpdateModal(id) {
    await refreshAccessToken();
    try {
        const response = await axios.get(`${api_url}/${id}`);
        const ann_info = response.data;
        populateUpdateForm(ann_info);
        document.getElementById('myUpdateModal').style.display = 'block';
    } catch (error) {
        // console.error('Error fetching announcement for update:', error);
    }
}

function populateUpdateForm(ann_info) {
    document.getElementById('tashkilot_nomi').value = ann_info.tashkilot_nomi;
    document.getElementById('phone').value = ann_info.phone;
    document.getElementById('name_of_employer').value = ann_info.name_of_employer;
    document.getElementById('project_name').value = ann_info.project_name;
    document.getElementById('deadline').value = ann_info.deadline.split('T')[0]; // Format date if needed
    document.getElementById('cost').value = ann_info.cost;
    document.getElementById('description').value = ann_info.description;

    // Populate file links or placeholders
    if (ann_info.file1) {
        document.getElementById('fileLink1').innerHTML = `<a href="${ann_info.file1}" target="_blank">${getFileName(ann_info.file1)}</a>`;
        document.getElementById('hiddenFile1').value = ann_info.file1;
    }
    if (ann_info.file2) {
        document.getElementById('fileLink2').innerHTML = `<a href="${ann_info.file2}" target="_blank">${getFileName(ann_info.file2)}</a>`;
        document.getElementById('hiddenFile2').value = ann_info.file2;
    }
    if (ann_info.file3) {
        document.getElementById('fileLink3').innerHTML = `<a href="${ann_info.file3}" target="_blank">${getFileName(ann_info.file3)}</a>`;
        document.getElementById('hiddenFile3').value = ann_info.file3;
    }
}

document.getElementById('myUpdateForm').onsubmit = async function (event) {
    event.preventDefault();
    await refreshAccessToken();

    const formData = new FormData(document.getElementById('myUpdateForm'));

    // Prepare data for PATCH request to handle file removals
    const patchData = {};
    if (document.getElementById('remove_file1').checked) {
        patchData['remove_file1'] = true;
    }
    if (document.getElementById('remove_file2').checked) {
        patchData['remove_file2'] = true;
    }
    if (document.getElementById('remove_file3').checked) {
        patchData['remove_file3'] = true;
    }

    // First, send PATCH request for file removals
    try {
        if (Object.keys(patchData).length > 0) {
            await axios.patch(`${api_url}/${ann_id}/`, patchData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // console.log('File removal updated successfully');
        }
    } catch (error) {
        // console.error('Error updating file removal:', error);
        return;  // Stop if the patch request fails
    }

    // Handle files: If no new file is selected, don't append anything to FormData
    if (!formData.get('file1') && document.getElementById('hiddenFile1').value && !document.getElementById('remove_file1').checked) {
        formData.delete('file1');
    }
    if (!formData.get('file2') && document.getElementById('hiddenFile2').value && !document.getElementById('remove_file2').checked) {
        formData.delete('file2');
    }
    if (!formData.get('file3') && document.getElementById('hiddenFile3').value && !document.getElementById('remove_file3').checked) {
        formData.delete('file3');
    }

    // Then, send PUT request for the rest of the form data
    try {
        const response = await axios.put(`${api_url}/${ann_id}/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // console.log('Announcement updated:', response.data);

        // Reset form fields
        document.getElementById('myUpdateForm').reset();

        // Close the modal
        document.getElementById('myUpdateModal').style.display = 'none';

        // Update displayed information if needed
        fetchAnnouncement(); // Optionally update the displayed info
    } catch (error) {
        // console.error('Error updating announcement:', error);
    }
};





document.getElementById('logoutBtn').addEventListener('click', async (event) => {
    await logOut();
});

async function logOut() {
    try {
        const s = await axios.post(`${api_url}/api/logout/`, {
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



document.querySelector('.btn-close').addEventListener('click', function() {
    document.getElementById('myUpdateModal').style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('myUpdateModal')) {
        document.getElementById('myUpdateModal').style.display = 'none';
    }
});

async function deleteAnnouncement(id) {
    await refreshAccessToken();
    if (confirm('Are you sure you want to delete this announcement?')) {
        try {
            const response = await axios.delete(`${api_url}/${id}/`);
            // console.log('Announcement deleted:', response);
            window.location.href = 'announcements.html'; // Redirect to another page
        } catch (error) {
            // console.error('Error deleting announcement:', error);
        }
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
        // console.error('Error refreshing token:', error);
        window.location.href = "../../index.html"; // Redirect to login page on token error
    }
}
