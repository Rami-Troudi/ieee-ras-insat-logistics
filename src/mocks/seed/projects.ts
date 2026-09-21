import { ProjectSummary } from "@/types";

export const INITIAL_PROJECTS: ProjectSummary[] = [
  {
    id: "proj-eurobot-2027",
    name: "Eurobot Tunisia 2027 Autonomous Rover",
    code: "EUR-27",
    description:
      "Autonomous competitive robotics team developing dual LiDAR navigation robots for the national robotics cup.",
    status: "ACTIVE",
    leadName: "Rami Troudi",
    membersCount: 8,
  },
  {
    id: "proj-ras-robocup",
    name: "RAS @Home Service Robot Platform",
    code: "RHOME-26",
    description: "Domestic assistive mobile manipulator robot built on ROS2 and depth cameras.",
    status: "ACTIVE",
    leadName: "Mohamed Ben Ali",
    membersCount: 6,
  },
  {
    id: "proj-aerobotix-drone",
    name: "Aerobotix Autonomous Quadcopter",
    code: "AERO-QC",
    description: "Indoor SLAM flight platform using optical flow and STM32 flight controller.",
    status: "PLANNING",
    leadName: "Sarra Mansour",
    membersCount: 4,
  },
];
