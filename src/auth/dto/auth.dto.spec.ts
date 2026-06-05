import { validate } from 'class-validator'

import { LoginDto, RegisterDto } from './auth.dto'

describe('auth DTOs', () => {
	it('allows login with email and password only', async () => {
		const dto = new LoginDto()
		dto.email = 'user@example.com'
		dto.password = 'password123'

		await expect(validate(dto)).resolves.toHaveLength(0)
	})

	it('requires name only for registration', async () => {
		const dto = new RegisterDto()
		dto.email = 'user@example.com'
		dto.password = 'password123'

		const errors = await validate(dto)

		expect(errors.map(error => error.property)).toContain('name')
	})
})
