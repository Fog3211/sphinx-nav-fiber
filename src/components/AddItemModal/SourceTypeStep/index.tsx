import { Button } from '@mui/material'
import { FC } from 'react'
import styled from 'styled-components'
import { Flex } from '~/components/common/Flex'
import { Text } from '~/components/common/Text'
import { AutoComplete } from './AutoComplete'

type Props = {
  onNextStep: () => void
  allowNextStep?: boolean
  onSelectType: (val: string) => void
  selectedType: string
}

export const SourceTypeStep: FC<Props> = ({ onNextStep, allowNextStep, onSelectType, selectedType }) => (
  <Flex data-testid="SourceTypeStep">
    <Flex align="center" direction="row" justify="space-between" mb={20}>
      <Flex align="center" direction="row">
        <StyledText>Select Type</StyledText>
      </Flex>
    </Flex>

    <Flex direction="row" mb={20}>
      <AutoComplete onSelect={onSelectType} selectedValue={selectedType} />
    </Flex>

    <Flex>
      <Button
        color="secondary"
        disabled={!allowNextStep}
        onClick={onNextStep}
        size="large"
        type="button"
        variant="contained"
      >
        Next
      </Button>
    </Flex>
  </Flex>
)

const StyledText = styled(Text)`
  font-size: 22px;
  font-weight: 600;
  font-family: 'Barlow';
`
