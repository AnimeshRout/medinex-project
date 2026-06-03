import { FaHome } from "react-icons/fa";
import { FaCalendarCheck } from "react-icons/fa";
import { FaUserMd } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi2";

export const adminMenu = [
  {
    name: "Dashboard",
    path: "/admin-dashboard",
    icon: FaHome
  },
  {
    name: "Appointments",
    path: "/all-appointments",
    icon: FaCalendarCheck
  },
  {
    name: "Add Doctor",
    path: "/add-doctor",
    icon: FaUserMd
  },
  {
    name: "Doctors List",
    path: "/doctors-list",
    icon: FaUsers
  },
  {
    name: "Patients List",
    path: "/patients-list",
    icon: HiUserGroup
  },
  {
    name: "My Profile",
    path: "/admin-profile",
    icon: FaUser
  }
];

export const doctorMenu = [
  {
    name: "Dashboard",
    path: "/doctor-dashboard",
    icon: FaHome
  },
  {
    name: "Appointments",
    path: "/doctor-appointments",
    icon: FaCalendarCheck
  },
  {
    name: "Profile",
    path: "/doctor-profile",
    icon: FaUser
  },
];