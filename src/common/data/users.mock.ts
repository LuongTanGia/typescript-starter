export interface User {
  id: number;
  email: string;
  password: string;
}

export const usersMock: User[] = [
  {
    id: 1,
    email: 'admin@gmail.com',
    password: '123456',
  },
  {
    id: 2,
    email: 'user1@gmail.com',
    password: '123456',
  },
];
