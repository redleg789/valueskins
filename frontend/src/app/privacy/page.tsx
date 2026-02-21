'use client';

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Privacy Policy</h1>
                <p style={{ color: '#71717a', marginBottom: '3rem' }}>Last updated: February 8, 2026</p>

                <div style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>1. Information We Collect</h2>
                        <p><strong style={{ color: 'white' }}>Account Information:</strong> Wallet address, email (optional), connected social accounts.</p>
                        <p><strong style={{ color: 'white' }}>Activity Data:</strong> Interactions on the platform, applications, completed deals, referrals.</p>
                        <p><strong style={{ color: 'white' }}>Social Data:</strong> Public information from connected platforms (follower counts, engagement metrics).</p>
                        <p><strong style={{ color: 'white' }}>Technical Data:</strong> IP address (hashed), browser type, device information.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>2. How We Use Your Information</h2>
                        <ul style={{ paddingLeft: '1.5rem' }}>
                            <li>Calculate and display your reputation score</li>
                            <li>Match you with relevant brand opportunities</li>
                            <li>Process payments and referral rewards</li>
                            <li>Improve the Platform and develop new features</li>
                            <li>Send notifications about opportunities and activity</li>
                            <li>Prevent fraud and abuse</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>3. On-Chain Data</h2>
                        <p>Your reputation score, level, and certain activity is stored on the blockchain and is publicly visible. This transparency is a core feature of the Platform and enables trustless verification. On-chain data cannot be deleted due to the immutable nature of blockchain technology.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>4. Information Sharing</h2>
                        <p>We share information with:</p>
                        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                            <li><strong style={{ color: 'white' }}>Brands:</strong> Your public profile and score when you apply to opportunities</li>
                            <li><strong style={{ color: 'white' }}>API Users:</strong> Verified information to third parties using our API (with your consent)</li>
                            <li><strong style={{ color: 'white' }}>Service Providers:</strong> For analytics, email delivery, and infrastructure</li>
                        </ul>
                        <p style={{ marginTop: '1rem' }}>We do not sell your personal information.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>5. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                            <li>Access your data</li>
                            <li>Correct inaccurate information</li>
                            <li>Delete your account (note: on-chain data cannot be deleted)</li>
                            <li>Export your data</li>
                            <li>Opt out of marketing communications</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>6. Data Security</h2>
                        <p>We implement industry-standard security measures including encryption, secure infrastructure, and regular security audits. However, no system is perfectly secure. You are responsible for securing your wallet and credentials.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>7. Data Retention</h2>
                        <p>We retain your data for as long as your account is active. After account deletion, we may retain certain data for legal compliance, fraud prevention, and dispute resolution for up to 3 years.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>8. Cookies and Tracking</h2>
                        <p>We use essential cookies for authentication and session management. We use analytics to understand how the Platform is used and improve the experience.</p>
                    </section>

                    <section>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>9. Contact</h2>
                        <p>For privacy-related inquiries, contact us at privacy@valueskins.io</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
