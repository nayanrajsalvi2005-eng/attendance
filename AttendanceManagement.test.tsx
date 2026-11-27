import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AttendanceManagement from './AttendanceManagement'

const roster = [
  { id: 1, name: 'Asha Patel' },
  { id: 2, name: 'Rohan Das' },
]

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  }
}

function mockAttendanceApi({ failRoster = false } = {}) {
  const fetchMock = vi.fn(async (input, options = {}) => {
    const url = String(input)
    if (url.includes('/attendance/students')) {
      return failRoster
        ? jsonResponse({ detail: 'Roster unavailable' }, 500)
        : jsonResponse(roster)
    }
    if (url.includes('/attendance/summary') || url.includes('/monthly-summary')) {
      return jsonResponse([])
    }
    if (url.includes('/attendance?attendance_date=')) return jsonResponse([])
    if (url.endsWith('/attendance') && options.method === 'POST') {
      return jsonResponse({ success: true })
    }
    return jsonResponse([])
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

// These cases verify attendance roster loading, status edits, and API error feedback.
describe('Attendance management', () => {
  it('loads the student roster and shows each current attendance status', async () => {
    mockAttendanceApi()

    render(<AttendanceManagement />)

    const rosterSection = screen.getByRole('heading', { name: "Who's in the room" }).closest('section')
    expect(rosterSection).not.toBeNull()
    expect(await within(rosterSection).findByText('Asha Patel')).toBeInTheDocument()
    expect(within(rosterSection).getByText('Rohan Das')).toBeInTheDocument()
    expect(within(rosterSection).getAllByText('Not marked')).toHaveLength(2)
  })

  it('saves a changed status for the selected attendance date', async () => {
    const user = userEvent.setup()
    const fetchMock = mockAttendanceApi()

    render(<AttendanceManagement />)

    const rosterSection = screen.getByRole('heading', { name: "Who's in the room" }).closest('section')
    const studentName = await within(rosterSection).findByText('Asha Patel')
    const studentCard = studentName.closest('.attendance-student-tile')
    expect(studentCard).not.toBeNull()
    await user.click(within(studentCard).getByRole('button', { name: 'Absent' }))

    await waitFor(() => {
      const saveCall = fetchMock.mock.calls.find(([url, options]) =>
        String(url).endsWith('/attendance') && options.method === 'POST',
      )
      expect(saveCall).toBeDefined()
      expect(JSON.parse(saveCall[1].body)).toEqual({
        attendanceDate: expect.any(String),
        records: [{ studentName: 'Asha Patel', status: 'Absent' }],
      })
    })

    expect(within(studentCard).getByText('Absent', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Asha Patel marked Absent.')
  })

  it('shows feedback when the student roster request fails', async () => {
    mockAttendanceApi({ failRoster: true })

    render(<AttendanceManagement />)

    expect(await screen.findByText('Students load nahi hue')).toBeInTheDocument()
    expect(screen.getByText("Who's in the room")).toBeInTheDocument()
    expect(screen.getByText('No students found.')).toBeInTheDocument()
  })
})
