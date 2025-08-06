import React from 'react';

const Footer = () => {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Modules', href: '#modules' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API Documentation', href: '#' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Contact', href: '#contact' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
    connect: [
      { name: 'Blog', href: '#' },
      { name: 'Newsletter', href: '#' },
      { name: 'Events', href: '#' },
      { name: 'Webinars', href: '#' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      href: '#',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12.017 0C8.396 0 7.999.01 6.756.048 5.517.087 4.668.222 3.935.42a5.902 5.902 0 00-2.134 1.384A5.902 5.902 0 00.42 3.935C.222 4.668.087 5.517.048 6.756.01 7.999 0 8.396 0 12.017c0 3.624.01 4.021.048 5.264.039 1.239.174 2.088.372 2.797.205.712.478 1.316.923 1.846.53.53 1.134.818 1.846.923.709.198 1.558.333 2.797.372 1.243.038 1.64.048 5.264.048 3.624 0 4.021-.01 5.264-.048 1.239-.039 2.088-.174 2.797-.372a5.902 5.902 0 001.846-.923c.53-.53.818-1.134.923-1.846.198-.709.333-1.558.372-2.797.038-1.243.048-1.64.048-5.264 0-3.621-.01-4.018-.048-5.261-.039-1.239-.174-2.088-.372-2.797a5.902 5.902 0 00-.923-1.846A5.902 5.902 0 0019.065.42c-.709-.198-1.558-.333-2.797-.372C16.025.01 15.628 0 12.017 0zM12.017 2.16c3.557 0 3.978.01 5.38.048 1.298.059 2.003.276 2.473.457.622.241 1.065.53 1.531.996.466.466.755.909.996 1.531.181.47.398 1.175.457 2.473.038 1.402.048 1.823.048 5.38 0 3.557-.01 3.978-.048 5.38-.059 1.298-.276 2.003-.457 2.473-.241.622-.53 1.065-.996 1.531-.466.466-.909.755-1.531.996-.47.181-1.175.398-2.473.457-1.402.038-1.823.048-5.38.048-3.557 0-3.978-.01-5.38-.048-1.298-.059-2.003-.276-2.473-.457a4.13 4.13 0 01-1.531-.996 4.13 4.13 0 01-.996-1.531c-.181-.47-.398-1.175-.457-2.473C2.17 15.995 2.16 15.574 2.16 12.017c0-3.557.01-3.978.048-5.38.059-1.298.276-2.003.457-2.473.241-.622.53-1.065.996-1.531a4.13 4.13 0 011.531-.996c.47-.181 1.175-.398 2.473-.457C8.039 2.17 8.46 2.16 12.017 2.16zm0 2.877a6.994 6.994 0 100 13.988 6.994 6.994 0 000-13.988zm0 11.531a4.537 4.537 0 110-9.074 4.537 4.537 0 010 9.074zm8.871-11.843a1.636 1.636 0 11-3.272 0 1.636 1.636 0 013.272 0z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        {/* Main Footer Content */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="ml-2 text-2xl font-bold text-white">HealthCare+</span>
            </div>
            <p className="text-gray-400 text-base max-w-md">
              Revolutionizing healthcare with AI-powered solutions that connect patients, 
              doctors, and administrators in one comprehensive platform.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-400 hover:text-white transition-colors duration-300">
                  <span className="sr-only">{item.name}</span>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Product</h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.product.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-base text-gray-400 hover:text-white transition-colors duration-300">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.company.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-base text-gray-400 hover:text-white transition-colors duration-300">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.support.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-base text-gray-400 hover:text-white transition-colors duration-300">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Connect</h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.connect.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-base text-gray-400 hover:text-white transition-colors duration-300">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="xl:col-span-1">
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                Subscribe to our newsletter
              </h3>
              <p className="mt-4 text-base text-gray-400">
                Get the latest health tips, product updates, and healthcare insights delivered to your inbox.
              </p>
            </div>
            <div className="mt-4 xl:mt-0 xl:col-span-2">
              <form className="sm:flex sm:max-w-md xl:max-w-lg">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  className="appearance-none min-w-0 w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-4 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:placeholder-gray-300"
                  placeholder="Enter your email"
                />
                <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
              HIPAA Compliance
            </a>
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; 2025 HealthCare+. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
