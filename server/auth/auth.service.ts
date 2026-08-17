import { User, UserRole } from '../../lib/types';

export class AuthService {
  signIn(role: UserRole, emailOrPhone: string): { success: boolean; user: User } {
    let user: User;

    if (role === 'patient') {
      const email = emailOrPhone || '';
      const nameFromEmail = email ? email.split('@')[0].replace(/[._]/g, ' ') : 'Registered Patient';
      user = {
        id: `pat-${Date.now()}`,
        email: email,
        name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        role: 'patient',
        clientId: `PN-PAT-${Math.floor(10000 + Math.random() * 90000)}`,
      };
    } else if (role === 'psychiatrist') {
      user = {
        id: 'usr-doc1',
        email: emailOrPhone || 'dr.ananda@psynova.lk',
        name: 'Dr. Ananda Wickramasinghe',
        role: 'psychiatrist',
        slmcRegNo: 'SLMC-38491',
        doctorId: 'doc-1',
      };
    } else if (role === 'admin') {
      user = {
        id: 'adm-1',
        email: emailOrPhone || 'admin.platform@psynova.lk',
        name: 'System Platform Admin',
        role: 'admin',
      };
    } else {
      user = {
        id: 'usr-guest',
        email: 'visitor@psynova.lk',
        name: 'Guest Visitor',
        role: 'guest',
      };
    }

    return { success: true, user };
  }

  signUp(role: UserRole, data: { fullName: string; emailOrPhone: string; slmcRegNo?: string }): { success: boolean; user: User } {
    const user: User = {
      id: `usr-${Date.now()}`,
      email: data.emailOrPhone,
      name: data.fullName,
      role,
      slmcRegNo: data.slmcRegNo,
      clientId: role === 'patient' ? `PN-PAT-${Math.floor(10000 + Math.random() * 90000)}` : undefined,
    };

    return { success: true, user };
  }
}
