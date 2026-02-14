"use server"

import { SignupFormSchema, FormState } from '@/app/lib/definitions'
// import { db } from '@/app/lib/db'
// import { users } from '@/app/lib/schema'
const bcrypt = require('bcrypt');
 
export async function signup(state: FormState, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
 
 const { name, email, password } = validatedFields.data
 const hashedPassword = await bcrypt.hash(password, 10)

  // const data = await db
  // .insert(users)
  // .values({
  //   name,
  //   email,
  //   password: hashedPassword,
  // })
  // .returning()  
}