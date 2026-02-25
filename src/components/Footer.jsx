import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black/50">
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 h-2">
            <div>
              <p className="text-lg text-white flex items-center justify-center align-items-center gap-2">
                Developed and Designed by
                <a
                  href="https://www.brandwar.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:opacity-80 transition-opacity"
                >
                  <img
                    src="https://www.brandwar.in/assets/images/resources/logo-1.png"
                    alt="Brandwar"
                    className="h-6 w-auto"
                  />
                </a>
              </p>
            </div>
          </div>
          <div className="text-xs text-white">
            © {new Date().getFullYear()} All rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
