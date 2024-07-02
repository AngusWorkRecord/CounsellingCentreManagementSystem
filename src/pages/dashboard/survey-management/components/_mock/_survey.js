import { randomInArray } from "../../../../../_mock"

const FormTitle = [
    'Coloproctology Survey',
    'Borneo Plastic Surgery Symposium Survey',
    'International Conference on Waqf and Endowment  Survey',
    'Gardenscapes Sarawak Survey',
    'Survey Question 5',
    'Survey Question 6',
    'Survey Question 7',
]

const FormType = [
    'Coloproctology 2023',
    'Borneo Plastic Surgery Symposium (BPSS) 2023',
    'International Conference on Waqf and Endowment (ICWE 2023)',
    'Gardenscapes Sarawak 2023',
    "Responsible Tourism",
    "Restour App",
    "Responsible Tourism",
]

const FormDescription = [
    '<div><b>Coloproctology 2023</b> Event Feedback Survey Form </div>',
    '<div><b>Borneo Plastic Surgery Symposium (BPSS) 2023</b> Event Feedback Survey Form </div>',
    '<div><b>International Conference on Waqf and Endowment (ICWE 2023)</b> Event Feedback Survey Form </div>',
    '<div><b>Gardenscapes Sarawak 2023</b> Event Feedback Survey Form </div>',
    '<div><b>Lorem Ipsum</b> Lorem Ipsum</div>',
    '<div><b>Lorem Ipsum</b> Lorem Ipsum</div>',
    '<div><b>Lorem Ipsum</b> Lorem Ipsum</div>',
]


const CreatedDate = [
    '2023/03/05 08:30',
    '2023/03/05 08:30',
    '2023/03/18 08:30',
    '2023/03/26 08:30',
    '2023/03/30 08:30',
    '2023/04/01 08:30',
    '2023/04/01 08:30',
]

const isArchived = [
    'archived',
    'archived',
    'active',
    'active',
    'archived',
    'archived',
    'archived',
]


const Respondent = [
    '40',
    '600',
    '680',
    '600',
    '120',
    '120',
    '120',
]

export const _mockObject = {
    FormID: (index) => `${index + 1}`,
    FormTitle: (index) => FormTitle[index],
    FormType: (index) => FormType[index],
    FormDescription: (index) => FormDescription[index],
    isArchived: (index) => isArchived[index],
    Respondent: (index) => Respondent[index],
    Questions: (index) => [],
    CreatedDate: (index) => CreatedDate[index],

}

export const _survey = [...Array(4)].map((_, index) => ({
    FormID: _mockObject.FormID(index),
    FormTitle: _mockObject.FormTitle(index),
    FormType: _mockObject.FormType(index),
    FormDescription: _mockObject.FormDescription(index),
    isArchived: _mockObject.isArchived(index),
    Respondent: _mockObject.Respondent(index),
    FormQuestions: _mockObject.Questions,
    CreatedDate: _mockObject.CreatedDate(index),
}));
