// Registry storing client-side script hydration strings for decoupled component execution
const IslandRegistry = {
    Newsletter: `
        (function(el, props) {
            el.innerHTML = \`
                <div style="border-left: 4px solid #111; padding-left: 15px;">
                    <h3>Join Our Newsletter</h3>
                    <p>Get exclusive articles curated for campaign: <strong>\${props.campaign}</strong></p>
                    <input type="email" id="ssg-email" placeholder="Enter your email" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 200px;" />
                    <button id="ssg-btn" style="padding: 8px 15px; background: #111; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px;">Subscribe</button>
                    <p id="ssg-msg" style="color: green; margin-top: 10px; display: none; font-weight: bold;">⚡ Success! Welcome aboard.</p>
                </div>
            \`;
            var btn = el.querySelector('#ssg-btn');
            if (btn) {
                btn.addEventListener('click', function() {
                    var email = el.querySelector('#ssg-email').value;
                    if(email) {
                        el.querySelector('#ssg-email').style.display = 'none';
                        btn.style.display = 'none';
                        el.querySelector('#ssg-msg').style.display = 'block';
                    }
                });
            }
        })(document.getElementById('%%ISLAND_ID%%'), %%PROPS%%);
    `,
    Paywall: `
        (function(el, props) {
            el.innerHTML = \`
                <div style="background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 4px;">
                    <strong>🔒 Premium Section Locked (\${props.tier})</strong>
                    <p>Unlock this full technical breakdown by authenticating your active staff tier pass.</p>
                    <button id="auth-btn" style="padding: 6px 12px; background: #856404; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Authenticate Instantly</button>
                </div>
            \`;
            var btn = el.querySelector('#auth-btn');
            if(btn) {
                btn.addEventListener('click', function() {
                    el.innerHTML = '<p style="color: green; font-weight: bold;">✅ Decryption verified! Access granted to premium metrics loop.</p>';
                });
            }
        })(document.getElementById('%%ISLAND_ID%%'), %%PROPS%%);
    `
};

module.exports = { IslandRegistry };
