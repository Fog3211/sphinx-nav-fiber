import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import * as FormHooks from 'react-hook-form'
import * as sphinx from 'sphinx-bridge'
import { AddItemModal } from '..'
import { colors } from '../../../utils/colors'
import { getLSat } from '../../../utils/getLSat'
// import * as lsatJs from 'lsat-js'

jest.mock('sphinx-bridge')
jest.mock('lsat-js')
jest.mock('../../../utils/getLSat')

jest.mock('~/stores/useModalStore', () => ({
  ...jest.requireActual('~/stores/useModalStore'),
  useModal: (id: string) => ({
    close: jest.fn(),
    open: jest.fn(),
    visible: id === 'addItem',
  }),
}))

const rednerAndInitForm = async () => {
  function getButtonByText(text: 'Prev' | 'Next') {
    return screen.getByText(text)
  }

  const result = render(<AddItemModal />)
  const { container } = result

  expect(screen.getByTestId('SourceTypeStep')).toBeInTheDocument()

  fireEvent.click(screen.getByText('Type'))
  fireEvent.click(screen.getByText('Corporation'))

  fireEvent.click(getButtonByText('Next'))
  expect(getButtonByText('Prev')).toBeInTheDocument()

  fireEvent.click(getButtonByText('Next'))

  await userEvent.type(container.querySelector('#cy-item-name')!, 'testName')

  fireEvent.click(getButtonByText('Next'))

  return result
}

describe('AddItemModal', () => {
  it('renders AddItemModal component correctly with correct props', async () => {
    const { container } = render(<AddItemModal />)

    const modal = container.querySelector('#addItem')

    expect(modal).toBeInTheDocument()
    expect(modal).toHaveAttribute('kind', 'small')
    expect(modal).toHaveStyle(`background: ${colors.BG1}`)
  })

  it('useForm hook is initialized with the correct default values and mode', async () => {
    const mockFormHooks = jest.spyOn(FormHooks, 'useForm')

    const mockUseForm = FormHooks.useForm

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockUseForm.mockImplementation(() => ({
      control: jest.fn(),
      watch: jest.fn(),
      handleSubmit: jest.fn(),
      reset: jest.fn(),
    }))

    render(<AddItemModal />)

    await waitFor(() => {
      expect(mockUseForm).toHaveBeenCalled()

      expect(mockUseForm).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'onChange',
        }),
      )
    })

    mockFormHooks.mockRestore()
  })

  it('navigates between steps correctly', async () => {
    const { container } = render(<AddItemModal />)

    function getButtonByText(text: 'Prev' | 'Next') {
      return screen.getByText(text)
    }

    expect(screen.getByTestId('SourceTypeStep')).toBeInTheDocument()
    expect(getButtonByText('Next')).toBeDisabled()

    fireEvent.click(screen.getByText('Type'))
    fireEvent.click(screen.getByText('Corporation'))

    expect(getButtonByText('Next')).not.toBeDisabled()

    fireEvent.click(getButtonByText('Next'))

    expect(screen.queryByTestId('SourceStep')).toBeInTheDocument()
    expect(getButtonByText('Prev')).toBeInTheDocument()

    fireEvent.click(getButtonByText('Prev'))
    expect(screen.getByTestId('SourceTypeStep')).toBeInTheDocument()

    fireEvent.click(getButtonByText('Next'))

    expect(getButtonByText('Next')).toBeDisabled()
    await userEvent.type(container.querySelector('#cy-item-name')!, 'testName')

    expect(getButtonByText('Next')).not.toBeDisabled()
    fireEvent.click(getButtonByText('Next'))

    expect(screen.getByTestId('BudgetStep')).toBeInTheDocument()
  })

  it('mock the API call to submit the form data and verify the form submission process', async () => {
    await rednerAndInitForm()
    fireEvent.click(screen.getByText('Approve'))

    await waitFor(() => {
      expect(sphinx.enable).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(getLSat).toHaveBeenCalled()
    })
  })

  it('verify that the form state and current step state are reset when the modal is closed', async () => {
    const { container, rerender } = render(<AddItemModal />)

    function getButtonByText(text: 'Prev' | 'Next') {
      return screen.getByText(text)
    }

    expect(screen.getByTestId('SourceTypeStep')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Type'))
    fireEvent.click(screen.getByText('Corporation'))

    fireEvent.click(getButtonByText('Next'))

    expect(screen.queryByTestId('SourceStep')).toBeInTheDocument()

    fireEvent.click(getButtonByText('Next'))

    await userEvent.type(container.querySelector('#cy-item-name')!, 'testName')

    fireEvent.click(getButtonByText('Next'))

    expect(screen.getByTestId('BudgetStep')).toBeInTheDocument()

    rerender(<AddItemModal key="newModal" />)

    expect(screen.getByTestId('SourceTypeStep')).toBeInTheDocument()
    expect(screen.queryByTestId('SourceStep')).not.toBeInTheDocument()
    expect(screen.queryByTestId('BudgetStep')).not.toBeInTheDocument()
  })
})
