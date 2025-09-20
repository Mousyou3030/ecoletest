export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Student extends User {
  studentId: string;
  classId: string;
  parentIds: string[];
  dateOfBirth: Date;
  address: string;
  phone?: string;
}

export interface Teacher extends User {
  teacherId: string;
  subjects: string[];
  classes: string[];
}

export interface Parent extends User {
  childrenIds: string[];
  phone: string;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  teacherId: string;
  studentIds: string[];
  schedule: Schedule[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  classId: string;
  subject: string;
  startDate: Date;
  endDate: Date;
  materials: string[];
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  teacherId: string;
  value: number;
  maxValue: number;
  type: 'exam' | 'homework' | 'participation' | 'project';
  date: Date;
  comments?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  courseId?: string;
  notes?: string;
}

export interface Schedule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
  classId: string;
  room: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  isRead: boolean;
}