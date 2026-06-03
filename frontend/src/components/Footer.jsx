import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="mt-32 w-full">

      {/* MAIN FOOTER */}

      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white">

        {/* CENTERED CONTAINER*/}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 text-sm">

            {/* BRAND */}
            <div>

              <img
                src={assets.logo}
                className="mb-6 w-40"
                alt="Medinex Logo"
              />

              <p className="text-white/80 leading-relaxed text-base">
                Medinex is your trusted healthcare partner. Book appointments
                with verified doctors and experience seamless medical services
                from the comfort of your home.
              </p>

            </div>

            {/* COMPANY LINKS */}
            <div>

              <h3 className="text-lg font-semibold mb-5">
                Company
              </h3>

              <ul className="space-y-3 text-white/80 text-base">

                <li>
                  <Link to="/" className="hover:text-white transition">
                    Home
                  </Link>
                </li>

                <li>
                  <Link to="/about" className="hover:text-white transition">
                    About Us
                  </Link>
                </li>

                <li>
                  <Link to="/doctors" className="hover:text-white transition">
                    Doctors
                  </Link>
                </li>

                <li>
                  <Link to="/contact" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>

              </ul>

            </div>

            {/* CONTACT */}
            <div>

              <h3 className="text-lg font-semibold mb-5">
                Get in Touch
              </h3>

              <ul className="space-y-3 text-base text-white/80">

                <li>📞 +91 7847944467</li>

                <li>✉️ support@medinex.com</li>

                <li>
                  📍 Bhubaneswar,
                  <br />
                  Odisha, India
                </li>

              </ul>

            </div>

            {/* MAP + SOCIAL */}
            <div>

              {/* MAP */}

              <div className="rounded-lg overflow-hidden border border-white/20 shadow-md h-40 mb-6">

                <iframe
                  title="Medinex Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://www.google.com/maps?q=Bhubaneswar,Odisha&output=embed"
                ></iframe>

              </div>

              {/* SOCIAL ICONS */}

              <div className="flex justify-center lg:justify-start gap-4">

                <a
                  href="#"
                  className="p-2 bg-white/20 rounded-full hover:bg-white hover:text-indigo-600 transition"
                >
                  <FaFacebookF />
                </a>

                <a
                  href="#"
                  className="p-2 bg-white/20 rounded-full hover:bg-white hover:text-indigo-600 transition"
                >
                  <FaInstagram />
                </a>

                <a
                  href="#"
                  className="p-2 bg-white/20 rounded-full hover:bg-white hover:text-indigo-600 transition"
                >
                  <FaTwitter />
                </a>

                <a
                  href="#"
                  className="p-2 bg-white/20 rounded-full hover:bg-white hover:text-indigo-600 transition"
                >
                  <FaLinkedinIn />
                </a>

                <a
                  href="#"
                  className="p-2 bg-white/20 rounded-full hover:bg-white hover:text-indigo-600 transition"
                >
                  <FaYoutube />
                </a>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* COPYRIGHT BAR */}

      <div className="border-t border-gray-200 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <p className="text-center text-sm sm:text-base text-gray-700">

            © {new Date().getFullYear()}{" "}

            <span className="font-semibold text-indigo-600">
              Medinex.com
            </span>

            {" "}— All Rights Reserved.

          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;