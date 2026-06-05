import { validate } from 'class-validator'

import { CreateTaskDto } from './task.dto'

describe('task DTOs', () => {
	it('does not require projectId in create task body', async () => {
		const dto = new CreateTaskDto()
		dto.title = 'Implement access control'

		await expect(validate(dto)).resolves.toHaveLength(0)
	})
})
