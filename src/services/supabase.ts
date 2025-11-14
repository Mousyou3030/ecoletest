import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseCourseService = {
  getAll: async (params?: any) => {
    let query = supabase
      .from('courses')
      .select(`
        *,
        teacher:users!teacher_id(id, first_name, last_name, email),
        class:classes!class_id(id, name, level)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (params?.teacherId) {
      query = query.eq('teacher_id', params.teacherId);
    }
    if (params?.classId) {
      query = query.eq('class_id', params.classId);
    }
    if (params?.subject) {
      query = query.eq('subject', params.subject);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      subject: course.subject,
      teacherId: course.teacher_id,
      classId: course.class_id,
      startDate: new Date(course.start_date),
      endDate: new Date(course.end_date),
      materials: course.materials || [],
      isActive: course.is_active,
      createdAt: new Date(course.created_at),
      teacher: course.teacher,
      class: course.class
    }));
  },

  create: async (courseData: any) => {
    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          title: courseData.title,
          description: courseData.description,
          subject: courseData.subject,
          teacher_id: courseData.teacherId,
          class_id: courseData.classId,
          start_date: courseData.startDate,
          end_date: courseData.endDate,
          materials: courseData.materials || []
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, courseData: any) => {
    const updateData: any = {};

    if (courseData.title) updateData.title = courseData.title;
    if (courseData.description !== undefined) updateData.description = courseData.description;
    if (courseData.subject) updateData.subject = courseData.subject;
    if (courseData.teacherId) updateData.teacher_id = courseData.teacherId;
    if (courseData.classId) updateData.class_id = courseData.classId;
    if (courseData.startDate) updateData.start_date = courseData.startDate;
    if (courseData.endDate) updateData.end_date = courseData.endDate;
    if (courseData.materials) updateData.materials = courseData.materials;

    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Course deleted successfully' };
  }
};

export const supabaseUserService = {
  getAll: async (params?: any) => {
    let query = supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (params?.role && params.role !== 'all') {
      query = query.eq('role', params.role);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.date_of_birth,
      isActive: user.is_active,
      createdAt: new Date(user.created_at)
    }));
  }
};

export const supabaseClassService = {
  getAll: async (params?: any) => {
    let query = supabase
      .from('classes')
      .select(`
        *,
        teacher:users!teacher_id(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return data.map(cls => ({
      id: cls.id,
      name: cls.name,
      level: cls.level,
      teacherId: cls.teacher_id,
      capacity: cls.capacity,
      description: cls.description,
      createdAt: new Date(cls.created_at),
      teacher: cls.teacher
    }));
  }
};

export const supabaseScheduleService = {
  getAll: async (params?: any) => {
    let query = supabase
      .from('schedules')
      .select(`
        *,
        teacher:users!teacher_id(id, first_name, last_name, email),
        class:classes!class_id(id, name, level)
      `)
      .eq('is_active', true)
      .order('day', { ascending: true });

    if (params?.teacherId) {
      query = query.eq('teacher_id', params.teacherId);
    }
    if (params?.classId) {
      query = query.eq('class_id', params.classId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(schedule => ({
      id: schedule.id,
      day: schedule.day,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      subject: schedule.subject,
      teacherId: schedule.teacher_id,
      classId: schedule.class_id,
      room: schedule.room,
      isActive: schedule.is_active,
      teacher: schedule.teacher,
      class: schedule.class
    }));
  },

  create: async (scheduleData: any) => {
    const { data, error } = await supabase
      .from('schedules')
      .insert([
        {
          day: scheduleData.day,
          start_time: scheduleData.startTime,
          end_time: scheduleData.endTime,
          subject: scheduleData.subject,
          teacher_id: scheduleData.teacherId,
          class_id: scheduleData.classId,
          room: scheduleData.room
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, scheduleData: any) => {
    const updateData: any = {};
    if (scheduleData.day) updateData.day = scheduleData.day;
    if (scheduleData.startTime) updateData.start_time = scheduleData.startTime;
    if (scheduleData.endTime) updateData.end_time = scheduleData.endTime;
    if (scheduleData.subject) updateData.subject = scheduleData.subject;
    if (scheduleData.teacherId) updateData.teacher_id = scheduleData.teacherId;
    if (scheduleData.classId) updateData.class_id = scheduleData.classId;
    if (scheduleData.room !== undefined) updateData.room = scheduleData.room;

    const { data, error } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('schedules')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Schedule deleted successfully' };
  }
};

export const supabaseGradeService = {
  getAll: async (params?: any) => {
    let query = supabase
      .from('grades')
      .select(`
        *,
        student:users!student_id(id, first_name, last_name, email),
        course:courses!course_id(id, title, subject),
        teacher:users!teacher_id(id, first_name, last_name, email)
      `)
      .order('date', { ascending: false });

    if (params?.studentId) {
      query = query.eq('student_id', params.studentId);
    }
    if (params?.courseId) {
      query = query.eq('course_id', params.courseId);
    }
    if (params?.teacherId) {
      query = query.eq('teacher_id', params.teacherId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(grade => ({
      id: grade.id,
      studentId: grade.student_id,
      courseId: grade.course_id,
      teacherId: grade.teacher_id,
      value: parseFloat(grade.value),
      maxValue: parseFloat(grade.max_value),
      type: grade.type,
      date: new Date(grade.date),
      comments: grade.comments,
      student: grade.student,
      course: grade.course,
      teacher: grade.teacher
    }));
  },

  create: async (gradeData: any) => {
    const { data, error } = await supabase
      .from('grades')
      .insert([
        {
          student_id: gradeData.studentId,
          course_id: gradeData.courseId,
          teacher_id: gradeData.teacherId,
          value: gradeData.value,
          max_value: gradeData.maxValue || 20,
          type: gradeData.type,
          date: gradeData.date,
          comments: gradeData.comments
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, gradeData: any) => {
    const updateData: any = {};
    if (gradeData.value !== undefined) updateData.value = gradeData.value;
    if (gradeData.maxValue !== undefined) updateData.max_value = gradeData.maxValue;
    if (gradeData.type) updateData.type = gradeData.type;
    if (gradeData.date) updateData.date = gradeData.date;
    if (gradeData.comments !== undefined) updateData.comments = gradeData.comments;

    const { data, error } = await supabase
      .from('grades')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Grade deleted successfully' };
  }
};

export const supabaseAttendanceService = {
  getAll: async (params?: any) => {
    let query = supabase
      .from('attendances')
      .select(`
        *,
        student:users!student_id(id, first_name, last_name, email),
        course:courses!course_id(id, title, subject),
        class:classes!class_id(id, name, level),
        marker:users!marked_by(id, first_name, last_name)
      `)
      .order('date', { ascending: false });

    if (params?.studentId) {
      query = query.eq('student_id', params.studentId);
    }
    if (params?.classId) {
      query = query.eq('class_id', params.classId);
    }
    if (params?.date) {
      query = query.eq('date', params.date);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(attendance => ({
      id: attendance.id,
      studentId: attendance.student_id,
      courseId: attendance.course_id,
      classId: attendance.class_id,
      date: new Date(attendance.date),
      status: attendance.status,
      notes: attendance.notes,
      markedBy: attendance.marked_by,
      student: attendance.student,
      course: attendance.course,
      class: attendance.class,
      marker: attendance.marker
    }));
  },

  create: async (attendanceData: any) => {
    const { data, error } = await supabase
      .from('attendances')
      .insert([
        {
          student_id: attendanceData.studentId,
          course_id: attendanceData.courseId,
          class_id: attendanceData.classId,
          date: attendanceData.date,
          status: attendanceData.status,
          notes: attendanceData.notes,
          marked_by: attendanceData.markedBy
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  bulkCreate: async (attendancesData: any[]) => {
    const inserts = attendancesData.map(attendance => ({
      student_id: attendance.studentId,
      course_id: attendance.courseId,
      class_id: attendance.classId,
      date: attendance.date,
      status: attendance.status,
      notes: attendance.notes,
      marked_by: attendance.markedBy
    }));

    const { data, error } = await supabase
      .from('attendances')
      .insert(inserts)
      .select();

    if (error) throw error;
    return data;
  },

  update: async (id: string, attendanceData: any) => {
    const updateData: any = {};
    if (attendanceData.status) updateData.status = attendanceData.status;
    if (attendanceData.notes !== undefined) updateData.notes = attendanceData.notes;

    const { data, error } = await supabase
      .from('attendances')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const supabaseMessageService = {
  getAll: async (params?: any) => {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, first_name, last_name, email, role),
        receiver:users!receiver_id(id, first_name, last_name, email, role),
        class:classes!class_id(id, name, level)
      `)
      .order('created_at', { ascending: false });

    if (params?.senderId) {
      query = query.eq('sender_id', params.senderId);
    }
    if (params?.receiverId) {
      query = query.eq('receiver_id', params.receiverId);
    }
    if (params?.type) {
      query = query.eq('type', params.type);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(message => ({
      id: message.id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      subject: message.subject,
      content: message.content,
      type: message.type,
      classId: message.class_id,
      isRead: message.is_read,
      createdAt: new Date(message.created_at),
      sender: message.sender,
      receiver: message.receiver,
      class: message.class
    }));
  },

  create: async (messageData: any) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: messageData.senderId,
          receiver_id: messageData.receiverId,
          subject: messageData.subject,
          content: messageData.content,
          type: messageData.type || 'individual',
          class_id: messageData.classId
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  markAsRead: async (id: string) => {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Message deleted successfully' };
  }
};

export const supabasePaymentService = {
  getAll: async (params?: any) => {
    let query = supabase
      .from('payments')
      .select(`
        *,
        student:users!student_id(id, first_name, last_name, email)
      `)
      .order('due_date', { ascending: false });

    if (params?.studentId) {
      query = query.eq('student_id', params.studentId);
    }
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.type) {
      query = query.eq('type', params.type);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(payment => ({
      id: payment.id,
      studentId: payment.student_id,
      amount: parseFloat(payment.amount),
      type: payment.type,
      status: payment.status,
      dueDate: new Date(payment.due_date),
      paidDate: payment.paid_date ? new Date(payment.paid_date) : null,
      method: payment.method,
      description: payment.description,
      student: payment.student
    }));
  },

  create: async (paymentData: any) => {
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          student_id: paymentData.studentId,
          amount: paymentData.amount,
          type: paymentData.type,
          status: paymentData.status || 'pending',
          due_date: paymentData.dueDate,
          paid_date: paymentData.paidDate,
          method: paymentData.method,
          description: paymentData.description
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, paymentData: any) => {
    const updateData: any = {};
    if (paymentData.amount !== undefined) updateData.amount = paymentData.amount;
    if (paymentData.status) updateData.status = paymentData.status;
    if (paymentData.paidDate) updateData.paid_date = paymentData.paidDate;
    if (paymentData.method) updateData.method = paymentData.method;
    if (paymentData.description !== undefined) updateData.description = paymentData.description;

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
