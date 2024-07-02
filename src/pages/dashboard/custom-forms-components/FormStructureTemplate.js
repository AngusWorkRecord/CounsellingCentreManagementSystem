import { isArrayNotEmpty, isStringNullOrEmpty } from "../../../utils/Helpers"

export const QUESTION_TYPE = {
    short_answer: { label: 'Short Answer', value: 'short-answer' },
    long_answer: { label: 'Long Answer', value: 'long-answer' },
    mulitiple_choice: { label: 'Multiple Choice', value: 'multiple-choice' },
    mulitiple_selection: { label: 'Checkbox', value: 'multiple-selection' },
    range: { label: 'Range', value: 'range' },
}

export const FormStructureTemplate = {
    shortAnswerComponent: {
        QuestionType: QUESTION_TYPE.short_answer.value,
        QuestionOrder: 0,
        QuestionLabel: 'Short Answer Label',
        QuestionPlaceholder: 'Write the label for the question',
        QuestionOptions: [],
        Range: 0,
        MinRangeLabel: '',
        MaxRangeLabel: '',
        isRequired: true,
    },

    longAnswerComponent: {
        QuestionType: QUESTION_TYPE.long_answer.value,
        QuestionOrder: 0,
        QuestionLabel: 'Long Answer Label',
        QuestionPlaceholder: 'Write the label for the question',
        QuestionOptions: [],
        Range: 0,
        MinRangeLabel: '',
        MaxRangeLabel: '',
        isRequired: true,
    },

    multipleChoiceComponent: {
        QuestionType: QUESTION_TYPE.mulitiple_choice.value,
        QuestionOrder: 0,
        QuestionLabel: 'Multiple Selection Question Label',
        QuestionPlaceholder: 'Write the label for the question',
        QuestionOptions: [{
            option: 'Option 1',
            value: 'Option 1'
        }],
        Range: 0,
        MinRangeLabel: '',
        MaxRangeLabel: '',
        isRequired: true,
    },

    multipleSelectionComponent: {
        QuestionType: QUESTION_TYPE.mulitiple_selection.value,
        QuestionOrder: 0,
        QuestionLabel: 'Long Answer Label',
        QuestionPlaceholder: 'Write the label for the question',
        QuestionOptions: [{
            option: 'Option 1',
            value: 'Option 1'
        }],
        Range: 5,
        MinRangeLabel: '',
        MaxRangeLabel: '',
        isRequired: true,
    },

    rangeComponent: {
        QuestionType: QUESTION_TYPE.range.value,
        QuestionOrder: 0,
        QuestionLabel: 'Range Question Label',
        QuestionPlaceholder: 'Write the label for the question',
        QuestionOptions: [],
        Range: 5,
        MinRangeLabel: 'Disagree',
        MaxRangeLabel: 'Agree',
        isRequired: true,
    },
}
