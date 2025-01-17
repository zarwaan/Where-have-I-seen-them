export function createProfileLink() {
    var link = document.createElement('a');
    link.classList.add('profile-signin');
    link.style.setProperty('text-decoration', 'none');
    link.style.borderBottom = "3px solid rgb(202,202,202)";
    link.style.paddingBottom = '2px';
    if (Cookies.get('userInfo')) {
        const user = JSON.parse(Cookies.get('userInfo'));
        console.log(user.username);
        console.log(user.user_id);

        document.querySelector('i.bi').classList.add('bi-person-fill');
        link.href = `/users/${user.username}`;
        link.textContent = user.username;
    }
    else {
        document.querySelector('i.bi').classList.add('bi-box-arrow-in-right');
        link.href = 'signin';
        link.textContent = 'Sign in';
    }
    document.querySelector('.profile').append(link);
}