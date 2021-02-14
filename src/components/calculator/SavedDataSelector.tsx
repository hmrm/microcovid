import i18n from 'i18n'
import React from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import { useTranslation } from 'react-i18next'
import { Trans } from 'react-i18next'
import { BsSearch } from 'react-icons/bs'

import { ControlLabel } from 'components/calculator/controls/ControlLabel'
import { CalculatorData } from 'data/calculate'
import { PartialData, prepopulated } from 'data/prepopulated'

const SavedDataLink: React.FunctionComponent<{
  currentData: CalculatorData
  setter: (newData: CalculatorData) => void
  scenarioName: string
  scenarioNameSetter: (newScenario: string) => void
}> = (props): React.ReactElement => {
  const setSavedData = (key: string): void => {
    let foundData: PartialData | CalculatorData | null = null
    foundData = prepopulated[key]

    if (foundData) {
      props.setter({
        ...props.currentData,
        ...foundData,
      })
    }
    props.scenarioNameSetter(key)
  }

  return (
    <Button
      className="p-0 m-0 border-0 scenario-shortcut"
      onClick={() => {
        setSavedData(props.scenarioName)
        props.scenarioNameSetter(props.scenarioName)
      }}
      size="lg"
      variant="link"
    >
      {props.children}
    </Button>
  )
}
export const SavedDataSelector: React.FunctionComponent<{
  currentData: CalculatorData
  setter: (newData: CalculatorData) => void
  scenarioName: string
  scenarioNameSetter: (newScenario: string) => void
  label?: string
}> = (props): React.ReactElement => {
  const { t } = useTranslation()
  const prepopulatedOptions = Object.keys(prepopulated)

  let selected: string[] = []
  if (props.scenarioName !== undefined && props.scenarioName !== '') {
    const selectedOption = props.scenarioName
    selected = [selectedOption]
  }

  const setSavedData = (key: string): void => {
    let foundData: PartialData | CalculatorData | null = null
    foundData = prepopulated[key]

    if (foundData) {
      props.setter({
        ...props.currentData,
        ...foundData,
      })
    }
    props.scenarioNameSetter(key)
  }

  const showMatchesAndCustomScenario = (
    option: string,
    props: { text: string; selected: string[] },
  ) => {
    const propsText: string = props.text || ''

    // User is considering switching scenarios. Show all options.
    if (props.selected.length > 0) {
      return true
    }
    if (option === i18n.t('scenario.custom')) {
      return true
    }

    // Remove diacritics, ignore case
    const normalizeString = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    return normalizeString(option).indexOf(normalizeString(propsText)) !== -1
  }

  const savedDataRef = React.createRef<Typeahead<string>>()
  return (
    <Form.Group id="predefined-typeahead-group">
      <ControlLabel
        id="predefined-typeahead"
        label={
          <Trans i18nKey="calculator.select_scenario">
            Look for a premade scenario or{' '}
            <SavedDataLink
              currentData={props.currentData}
              setter={props.setter}
              scenarioName={t('scenario.custom')}
              scenarioNameSetter={props.scenarioNameSetter}
            >
              build your own
            </SavedDataLink>
          </Trans>
        }
      />
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>
            <BsSearch />
          </InputGroup.Text>
        </InputGroup.Prepend>
        <Typeahead
          clearButton={true}
          emptyLabel={t('calculator.no_prebuilt_scenario_found')}
          filterBy={showMatchesAndCustomScenario}
          highlightOnlyResult={true}
          id="predefined-typeahead"
          inputProps={{
            autoComplete: 'chrome-off',
            shouldSelectHint: (shouldSelect: boolean, event) => {
              // If a user starts typing a scenario and an autocomplete
              // hint appears in the input bar for the rest of the
              // scenario name, pressing the tab button selects the
              // autocomplete hint. shouldSelectHint is necessary to have
              // the same behaviour when hitting the enter key instead.
              if (event.keyCode === 13 /* return */) {
                return true
              }
              return shouldSelect
            },
          }}
          multiple
          onChange={(e: string[]) => {
            if (e.length === 0) {
              setSavedData(t('scenario.custom'))
            }
            setSavedData(e[e.length - 1])
          }}
          onFocus={() => {
            // If the user clicks anywhere in the box, highlight all the
            // text so that they can start searching for a new scenario
            // immediately.
            if (savedDataRef.current) {
              savedDataRef.current.getInput().select()
            }
          }}
          options={prepopulatedOptions}
          ref={savedDataRef}
          selected={selected}
        />
      </InputGroup>
    </Form.Group>
  )
}
