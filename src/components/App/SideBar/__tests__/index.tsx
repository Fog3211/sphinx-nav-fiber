import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { SideBar } from '..'
import { useAppStore } from '../../../../stores/useAppStore'
import { AppProviders } from '../../Providers'

jest.mock('../../Splash/SpiningSphere', () => jest.fn(() => <div data-testid="SpiningSphere" />))
jest.mock('../../SideBar/Episode/Timestamp/Equalizer', () => jest.fn(() => <div data-testid="Equalizer" />))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('SideBar Component', () => {
  it('test the visibility of sidebar with sidebarIsOpen state', async () => {
    const App = () => {
      const form = useForm<FormData>({ mode: 'onChange' })

      return (
        <AppProviders>
          <FormProvider {...form}>
            <SideBar onSubmit={jest.fn()} />
          </FormProvider>
        </AppProviders>
      )
    }

    render(<App />)

    useAppStore.getState().setSidebarOpen(true)

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-wrapper')).toBeInTheDocument()
    })

    useAppStore.getState().setSidebarOpen(false)

    await waitFor(() => {
      expect(screen.queryByTestId('sidebar-wrapper')).not.toBeInTheDocument()
    })
  })
})
