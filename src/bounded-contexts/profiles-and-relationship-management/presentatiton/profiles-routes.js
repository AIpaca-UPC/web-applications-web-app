/**
 * Routes for the Profiles & Relationship Management
 * bounded context.
 */
const profilesRoutes = [
    {
        path: '',
        redirect: { name: 'profiles-students-list' }
    },
    {
        path: 'students',
        name: 'profiles-students-list',
        component: () => import('./views/student-list.vue'),
        meta: { title: 'Students' }
    },
    {
        path: 'students/new',
        name: 'profiles-student-new',
        component: () => import('./views/student-form.vue'),
        meta: { title: 'New Student' }
    },
    {
        path: 'students/:id/edit',
        name: 'profiles-student-edit',
        component: () => import('./views/student-form.vue'),
        meta: { title: 'Edit Student' }
    },
    {
        path: 'students/:id',
        name: 'profiles-student-detail',
        component: () => import('./views/student-detail.vue'),
        meta: { title: 'Student Detail' }
    },
    {
        path: 'profiles/:id/edit',
        name: 'profiles-profile-edit',
        component: () => import('./views/profile-form.vue'),
        meta: { title: 'Edit Profile' }
    },
    {
        path: 'profiles/:id',
        name: 'profiles-profile-detail',
        component: () => import('./views/profile-detail.vue'),
        meta: { title: 'Profile Detail' }
    }
];

export default profilesRoutes;