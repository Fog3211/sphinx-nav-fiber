import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { SideBar } from '..'
import { useAppStore } from '../../../../stores/useAppStore'
import { useDataStore } from '../../../../stores/useDataStore'
import { AppProviders } from '../../Providers'

jest.mock('../../Splash/SpiningSphere', () => jest.fn(() => <div data-testid="SpiningSphere" />))
jest.mock('../../SideBar/Episode/Timestamp/Equalizer', () => jest.fn(() => <div data-testid="Equalizer" />))
jest.mock('../../../Icons/ClearIcon', () => jest.fn(() => <div data-testid="ClearIcon" />))
jest.mock('../../../Icons/SearchIcon', () => jest.fn(() => <div data-testid="SearchIcon" />))

// jest.mock('../Latest', () => ({
//   ...jest.requireActual('../Latest'),
//   LatestView: jest.fn(() => <div data-testid="LatestView" style={{ height: '2000px' }} />),
// }))

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

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm<FormData>({ mode: 'onChange' })

  return (
    <AppProviders>
      <FormProvider {...form}>{children}</FormProvider>
    </AppProviders>
  )
}

const handleSearch = () =>
  jest.fn().mockImplementation((v: string) => {
    useAppStore.getState().setCurrentSearch(v)
  })

describe('SideBar Component', () => {
  // beforeEach(() => {
  //   useAppStore.getState().clearSearch()
  // })

  it('test the visibility of sidebar with sidebarIsOpen state', async () => {
    render(<SideBar onSubmit={handleSearch} />, { wrapper: Wrapper })

    useAppStore.getState().setSidebarOpen(true)

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-wrapper')).toBeInTheDocument()
    })

    useAppStore.getState().setSidebarOpen(false)

    await waitFor(() => {
      expect(screen.queryByTestId('sidebar-wrapper')).not.toBeInTheDocument()
    })
  })

  it.skip('test that typing into the search bar updates the search term in the application state', async () => {
    render(<SideBar onSubmit={handleSearch} />, { wrapper: Wrapper })

    useAppStore.getState().setSidebarOpen(true)

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-wrapper')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement

    fireEvent.change(searchInput, { target: { value: 'test text' } })

    expect(searchInput.value).toBe('test text')
    expect(useAppStore.getState().currentSearch).toBe('test text')
  })

  it.skip('test that the clear icon appears when there is a search term and clears the search on click', async () => {
    render(<SideBar onSubmit={handleSearch} />, { wrapper: Wrapper })

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement

    fireEvent.change(searchInput, { target: { value: 'search query' } })

    fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(handleSearch).toHaveBeenCalled()

    useDataStore.getState().setIsFetching(false)

    expect(screen.getByTestId('ClearIcon')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('ClearIcon'))

    expect(searchInput.value).toBe('')
  })

  it('test that the search icon is displayed when there is no search term', async () => {
    render(<SideBar onSubmit={handleSearch} />, { wrapper: Wrapper })

    useAppStore.getState().setSidebarOpen(true)

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-wrapper')).toBeInTheDocument()
    })

    expect(screen.getByTestId('SearchIcon')).toBeInTheDocument()
  })

  it.skip('test that scrolling in the sidebar adds a shadow effect to the search area', async () => {
    render(<SideBar onSubmit={handleSearch} />, { wrapper: Wrapper })

    useAppStore.getState().setSidebarOpen(true)
    useDataStore.getState().setIsFetching(false)

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-wrapper')).toBeInTheDocument()
    })

    const searchWrapper = screen.getByTestId('search-wrapper')

    expect(searchWrapper).not.toHaveClass('has-shadow')

    fireEvent.scroll(searchWrapper, { target: { scrollTop: 100 } })

    expect(searchWrapper).toHaveClass('has-shadow')
  })

  it('test that the ClipLoader is shown when isLoading is true', async () => {
    render(<SideBar onSubmit={handleSearch} />, { wrapper: Wrapper })

    useAppStore.getState().setSidebarOpen(true)

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-wrapper')).toBeInTheDocument()
    })

    useDataStore.getState().setIsFetching(true)

    await waitFor(() => {
      expect(screen.getByTestId('SpiningSphere')).toBeInTheDocument()
    })
  })

  it('test that content is correctly displayed based on the loading state and search term', async () => {
    render(<SideBar onSubmit={handleSearch} />, { wrapper: Wrapper })

    useAppStore.getState().setSidebarOpen(true)

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-wrapper')).toBeInTheDocument()
    })

    useDataStore.getState().setIsFetching(true)

    await waitFor(() => {
      expect(screen.getByTestId('SpiningSphere')).toBeInTheDocument()
    })
  })
})
