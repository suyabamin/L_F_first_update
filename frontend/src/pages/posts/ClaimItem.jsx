import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';
import '../../styles/legacy.css';

const ClaimItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        nid: '',
        proofDetails: '',
        additionalInfo: '',
        confirm_claim: false
    });

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

    const fetchItemDetails = async () => {
        try {
            const response = await api.get(`/item.php?id=${id}`);
            if (response.success) {
                setItem(response.data.item);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.confirm_claim) {
            alert('Please confirm ownership');
            return;
        }

        setSubmitting(true);
        try {
            const result = await api.post('/claim_item.php', {
                item_id: id,
                ...formData
            });
            if (result.success) {
                setShowModal(true);
            }
        } catch (err) {
            alert(err.message || 'Error submitting claim');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <MainLayout><div className="loading">Loading...</div></MainLayout>;
    if (!item) return <MainLayout><div className="error">Item not found</div></MainLayout>;

    return (
        <MainLayout>
            <header className="topline">
                <div className="header-left">
                    <p className="eyebrow"><i className="fa-solid fa-gavel"></i> Claim Process</p>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Claim item request</h1>
                    <p className="subtitle">Submit your claim with proof of ownership to get your lost item back</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button className="filter-btn" onClick={() => navigate('/police-gd')}>
                        <i className="fa-solid fa-file-shield"></i> Police GD Form
                    </button>
                </div>
            </header>

            <div className="item-summary" style={{ background: 'white', borderRadius: '24px', padding: '24px', display: 'flex', gap: '24px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
                <div className="item-image" style={{ width: '120px', height: '120px', background: '#f5e6d3', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="fa-solid fa-briefcase" style={{ fontSize: '50px', color: '#8b5e3c' }}></i>
                </div>
                <div className="item-details">
                    <span className="pill found" style={{ marginBottom: '10px' }}>Found</span>
                    <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>{item.title}</h2>
                    <div className="item-meta" style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '13px' }}>
                        <span><i className="fa-solid fa-location-dot"></i> {item.location_name}</span>
                        <span><i className="fa-solid fa-clock"></i> {item.timeAgo}</span>
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>{item.description}</p>
                </div>
            </div>

            <div className="legacy-card" style={{ background: 'white', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700 }}><i className="fa-solid fa-file-signature"></i> Claim Request Form</h3>
                </div>

                <form className="form-grid" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Full Name *</label>
                        <input 
                            type="text" 
                            className="legacy-input" 
                            placeholder="Enter your full name" 
                            required 
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>
                    <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Email Address *</label>
                        <input 
                            type="email" 
                            className="legacy-input" 
                            placeholder="your@email.com" 
                            required 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Phone Number *</label>
                        <input 
                            type="tel" 
                            className="legacy-input" 
                            placeholder="+880 1XXX-XXXXXX" 
                            required 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>NID / Passport Number</label>
                        <input 
                            type="text" 
                            className="legacy-input" 
                            placeholder="Optional for verification" 
                            value={formData.nid}
                            onChange={(e) => setFormData({...formData, nid: e.target.value})}
                        />
                    </div>
                    <div className="form-field" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px' }}>Ownership Proof Details *</label>
                        <textarea 
                            rows="5" 
                            className="legacy-input" 
                            placeholder="Describe specific details only the real owner would know" 
                            required
                            value={formData.proofDetails}
                            onChange={(e) => setFormData({...formData, proofDetails: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="form-field" style={{ gridColumn: 'span 2' }}>
                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={formData.confirm_claim}
                                onChange={(e) => setFormData({...formData, confirm_claim: e.target.checked})}
                            />
                            I confirm that the information provided is accurate and I am the rightful owner.
                        </label>
                    </div>
                    <div className="form-actions" style={{ gridColumn: 'span 2', display: 'flex', gap: '16px' }}>
                        <button type="submit" className="legacy-btn primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Claim Request'}
                        </button>
                        <button type="button" className="legacy-btn" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </form>
            </div>

            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: 'white', padding: '40px', borderRadius: '28px', textAlign: 'center', maxWidth: '500px' }}>
                        <i className="fa-solid fa-circle-check" style={{ fontSize: '70px', color: '#10b981', marginBottom: '20px' }}></i>
                        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Claim Submitted Successfully!</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>Your claim request has been received. Our team will review your submission and contact you within 24-48 hours.</p>
                        <button className="legacy-btn primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default ClaimItem;
