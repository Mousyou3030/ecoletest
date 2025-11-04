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
