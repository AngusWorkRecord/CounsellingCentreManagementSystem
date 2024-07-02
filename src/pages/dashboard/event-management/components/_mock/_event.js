import { randomInArray } from "../../../../../_mock"

const EventName = [
    'Coloproctology 2023',
    'Borneo Plastic Surgery Symposium (BPSS) 2023',
    'International Conference on Waqf and Endowment (ICWE 2023)',
    'Gardenscapes Sarawak 2023',
    'Childhood Cancer International (CCI) Asia Conference 2023',
    'Annual Conference of the International Association for Impact Assessment (IAIA) 2023',
    'ORBICOM 2023',
]

const EventType = [
    "National Conference",
    "National Convention, State Convention",
    "International Conference",
    "National Conference",
    "International Conference",
    "International Conference",
    "International Conference",
]

const EventWebContent = [
    '<div><b>Lorem Ipsum</b> Lorem Ipsum</div>',
    '<div><b>Lorem Ipsum</b> Lorem Ipsum</div>',
    '<div><b>Lorem Ipsum</b> Lorem Ipsum</div>',
    '<div><b>Lorem Ipsum</b> Lorem Ipsum</div>',
    '<div><b>Lorem Ipsum</b> Lorem Ipsum</div>',
    '<div><b>Lorem Ipsum</b> Lorem Ipsum</div>',
    '<div><b>Lorem Ipsum</b> Lorem Ipsum</div>',
]

const EventLocationType = [
    'Physical',
    'Physical',
    'Physical',
    'Physical',
    'Physical',
    'Physical',
    'Physical',
]

const EventStartDatetime = [
    '2023/03/02 08:00',
    '2023/03/03 08:00',
    '2023/03/16 08:00',
    '2023/03/24 08:00',
    '2023/05/06 08:00',
    '2023/05/18 08:00',
    '2023/06/07 08:00',
]

const EventEndDatetime = [
    '2023/03/05 17:00',
    '2023/03/04 17:00',
    '2023/03/17 17:00',
    '2023/03/26 17:00',
    '2023/05/07 17:00',
    '2023/05/21 17:00',
    '2023/06/09 17:00',
]

const Status = [
    'finished',
    'finished',
    'finished',
    'finished',
    'incoming',
    'incoming',
    'incoming',
]


const EntranceFee = [
    '800.00',
    '4060.24',
    '450.00',
    '450.00',
    '200.00',
    '4060.00',
    '557.00',
]

const Participants = [
    '40/50',
    '600/700',
    '700/800',
    '700/800',
    '780/800',
    '788/800',
    '580/1000',
]

const EventWebURL = [
    'https://businesseventssarawak.com/event/coloproctology-2023/',
    'https://businesseventssarawak.com/event/borneo-plastic-surgery-symposium-bpss-2023/',
    'https://businesseventssarawak.com/event/international-waqf-and-endowment-conference-2023/',
    'https://businesseventssarawak.com/event/gardenscapes-sarawak-2023/',
    'https://businesseventssarawak.com/event/childhood-cancer-international-cci-asia-conference-2023/',
    'https://businesseventssarawak.com/event/annual-conference-of-the-international-association-for-impact-assessment-iaia-2023/',
    'https://businesseventssarawak.com/event/orbicom-unesco-2021/',
]

const EventLocation = [
    'Pullman Hotel Kuching',
    'Imperial Hotel Kuching',
    'DeTAR Putra UNIMAS',
    'Imperial Hotel Kuching',
    'The Waterfront Hotel',
    'Borneo Convention Centre Kuching (BCCK)',
    'Pullman Miri Waterfront Hotel',
]


export const _mockEvents = {
    EventID: (index) => `${index + 1}`,
    EventName: (index) => EventName[index],
    EventType: (index) => EventType[index],
    EventWebContent: (index) => EventWebContent[index],
    // EventWebURL: (index) => `https://localhost:3000/ConferenceEvent/${EventName[index]}`,
    EventWebURL: (index) => EventWebURL[index],
    EventLocationType: (index) => EventLocationType[index],
    EventPhysicalLocation: (index) =>  EventLocation[index],
    EventVirtualLocation: (index) => `https://zoom.us`,
    EventStartDatetime: (index) => EventStartDatetime[index],
    EventEndDatetime: (index) => EventEndDatetime[index],
    EntranceFee: (index) => EntranceFee[index],
    Participants: (index) => Participants[index],
    Status: (index) => Status[index],

}

export const _events = [...Array(7)].map((_, index) => ({
    EventID: _mockEvents.EventID(index),
    EventName: _mockEvents.EventName(index),
    EventType: _mockEvents.EventType(index),
    EventWebContent: _mockEvents.EventWebContent(index),
    EventWebURL: _mockEvents.EventWebURL(index),
    EventLocationType: _mockEvents.EventLocationType(index),
    EventPhysicalLocation: _mockEvents.EventPhysicalLocation(index),
    EventVirtualLocation: _mockEvents.EventVirtualLocation(index),
    EventStartDatetime: _mockEvents.EventStartDatetime(index),
    EventEndDatetime: _mockEvents.EventEndDatetime(index),
    EntranceFee: _mockEvents.EntranceFee(index),
    Participants: _mockEvents.Participants(index),
    Status: _mockEvents.Status(index),
}));
