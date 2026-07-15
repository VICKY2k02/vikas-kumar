import { useEffect, useState } from "react";

import { getProfile } from "../api/authApi";

import "../pages/auth/styles/profile.css";

const Profile = () => {

    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {

        loadProfile();

    }, []);

const loadProfile = async () => {
    try {
        const res = await getProfile();
        setProfile(res.data);
    } catch (err) {
        console.error(err);
    }
};

    if (!profile) {

        return <h2>Loading...</h2>;

    }

    return (

        <div className="profile-page">

            <div className="profile-card">

                <h2>User Profile</h2>

                <div className="profile-item">
                    <strong>Name</strong>
                    <span>{profile.name}</span>
                </div>

                <div className="profile-item">
                    <strong>Email</strong>
                    <span>{profile.email}</span>
                </div>

                <div className="profile-item">
                    <strong>Role</strong>
                    <span>{profile.role}</span>
                </div>

                <div className="profile-item">
                    <strong>Company</strong>
                    <span>{profile.company}</span>
                </div>

                <div className="profile-item">
                    <strong>Last Login</strong>
                    <span>{profile.last_login}</span>
                </div>

                <div className="profile-item">
                    <strong>Account Status</strong>
                    <span>{profile.status}</span>
                </div>

            </div>

        </div>

    );

};

export default Profile;