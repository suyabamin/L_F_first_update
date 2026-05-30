import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';
import PostCard from '../../components/cards/PostCard';
import '../../styles/legacy.css';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            // Reusing browse API or dedicated favorite API
            const response = await api.get('/me.php');
            if (response.success) {
                // Fetch full items if base me.php only gives IDs, 
                // but let's assume we can fetch favorited items or filter browse
                const itemsRes = await api.get('/browse_listing.php');
                if (itemsRes.success) {
                    setFavorites(itemsRes.data.filter(item => item.isFavorite));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <header className="topline">
                <div>
                    <p className="eyebrow"><i className="fas fa-heart"></i> Personal Collection</p>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Saved items</h1>
                    <p className="subtitle">Items you've bookmarked for quick access</p>
                </div>
            </header>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : favorites.length > 0 ? (
                <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {favorites.map((post, idx) => (
                        <PostCard key={post.id} post={post} delay={`${idx * 0.1}s`} />
                    ))}
                </div>
            ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '100px' }}>
                    <i className="fas fa-heart-broken" style={{ fontSize: '64px', opacity: 0.1, marginBottom: '20px', display: 'block' }}></i>
                    <h3>No saved items</h3>
                    <p style={{ color: '#64748b' }}>Start bookmarking items you care about!</p>
                </div>
            )}
        </MainLayout>
    );
};

export default Favorites;
