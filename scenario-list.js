// Role-play scenes. One line each: id, cat, title, emoji, role, goal, opener.
export const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "daily", label: "☕ 일상" },
  { id: "travel", label: "✈️ 여행" },
  { id: "love", label: "💕 데이트·친구" },
  { id: "service", label: "🔧 수리·서비스" },
  { id: "work", label: "💼 회사" },
];

const s = (id, cat, title, emoji, role, goal, opener) => ({ id, cat, title, emoji, role, goal, opener });

export const SCENARIOS = [
  // ☕ daily
  s("cafe", "daily", "카페에서 주문하기", "☕", "a friendly barista at a coffee shop", "The user orders a drink and maybe a snack, and pays.", "Hi there! Welcome in. What can I get for you today?"),
  s("restaurant", "daily", "식당에서 주문하기", "🍝", "a server at a casual restaurant", "The user gets a table, orders food and drinks, asks about the menu, and asks for the check.", "Good evening! Table for how many?"),
  s("shopping", "daily", "옷 가게 쇼핑", "👕", "a sales assistant in a clothing store", "The user looks for an item, asks about size, color, and price, and tries something on.", "Hi! Are you looking for anything in particular today?"),
  s("grocery", "daily", "마트 계산대", "🛒", "a cashier at a grocery store", "The user checks out: bags, loyalty card, paying by card, maybe a price question.", "Hey, how's it going? Did you find everything okay?"),
  s("gym", "daily", "헬스장 등록하기", "🏋️", "a front desk staff member at a gym", "The user asks about membership prices, hours, classes, and signs up.", "Hi! Are you interested in a membership?"),
  s("post", "daily", "우체국에서 택배 보내기", "📦", "a postal clerk", "The user sends a package overseas: size, weight, speed, price, customs form.", "Next in line! What are we sending today?"),
  s("neighbor", "daily", "새 이웃과 인사", "🏡", "a friendly neighbor who just noticed the user moved in next door", "Small talk: introducing themselves, the neighborhood, trash day, good places nearby.", "Hey there! You just moved in, right? Welcome to the neighborhood!"),
  s("vet", "daily", "동물병원 가기", "🐶", "a receptionist at a veterinary clinic", "The user explains what is wrong with their pet and books a check-up.", "Hi, welcome in. Who do we have here today?"),
  // ✈️ travel
  s("airport", "travel", "공항 체크인", "✈️", "an airline check-in agent at the airport", "The user checks in for a flight: passport, luggage, seat preference.", "Good morning! May I see your passport, please?"),
  s("immigration", "travel", "입국 심사", "🛂", "an immigration officer at the US border", "The user answers questions: purpose of visit, length of stay, where they will stay.", "Next. Passport, please. What's the purpose of your visit?"),
  s("directions", "travel", "길 물어보기", "🗺️", "a helpful local person on the street in a big city", "The user asks how to get to a place (station, museum, restaurant).", "Hi! You look a little lost. Can I help you?"),
  s("hotel", "travel", "호텔 체크인", "🏨", "a front desk clerk at a hotel", "The user checks in, confirms the reservation, and asks about breakfast, Wi-Fi, or checkout time.", "Welcome to the Grand Hotel. Do you have a reservation with us?"),
  s("hotelProblem", "travel", "호텔 방 문제 말하기", "🚿", "a front desk clerk at a hotel", "The user complains politely about a room problem (no hot water, noisy, AC broken) and asks for a fix or new room.", "Front desk, this is Sam. How can I help you?"),
  s("taxi", "travel", "택시·우버 타기", "🚕", "a taxi driver", "The user gives the destination, talks about the route or time, and pays.", "Hi there, where are you heading today?"),
  s("rentalCar", "travel", "렌터카 빌리기", "🚗", "an agent at a car rental counter", "The user picks up a reserved car: license, insurance options, fuel policy, return time.", "Hi, welcome! Do you have a reservation with us?"),
  s("train", "travel", "기차표 사기", "🚆", "a ticket agent at a train station", "The user buys a ticket: destination, time, one-way or round trip, seat.", "Hi, where are you traveling to today?"),
  s("lostItem", "travel", "분실물 찾기", "🎒", "a staff member at a lost and found office", "The user describes something they lost (bag, phone, wallet), where and when.", "Hi, lost and found. What did you lose?"),
  s("tourInfo", "travel", "관광 안내소", "📍", "a staff member at a tourist information center", "The user asks for things to do, tours, and the best local food.", "Hi! Welcome to Portland. What are you interested in seeing?"),
  // 💕 love & friends
  s("firstDate", "love", "첫 데이트 대화", "💕", "the user's date on a first date at a cozy wine bar; warm, curious, a little nervous", "Get to know each other: jobs, hobbies, travel, favorite food; keep it light and fun.", "Hey! Sorry, I hope you weren't waiting long. You look great."),
  s("dateDinner", "love", "데이트 저녁 메뉴 고르기", "🍷", "the user's partner having dinner together at a restaurant", "Decide what to order together, share opinions, talk about the day.", "Okay, everything looks so good. What are you in the mood for?"),
  s("datingApp", "love", "소개팅 앱 첫 메시지", "📱", "someone the user just matched with on a dating app, chatting by text", "Casual first chat: say hi, find common interests, maybe plan to meet.", "Hey! I saw you like hiking too. What's your favorite trail?"),
  s("movie", "love", "영화 뭐 볼지 정하기", "🎬", "the user's close friend choosing a movie together", "Agree on a movie and a time; share likes and dislikes.", "So, what are we watching tonight? I'm thinking something funny."),
  s("friend", "love", "친구와 주말 약속", "🎉", "the user's English-speaking friend", "Make weekend plans together: what to do, when and where to meet.", "Hey! Are you free this weekend? We should hang out."),
  s("party", "love", "생일 파티에서 처음 만난 사람", "🎂", "a guest at a friend's birthday party meeting the user for the first time", "Small talk: how they know the host, work, hobbies.", "Hi! I don't think we've met. How do you know Jess?"),
  s("intro", "love", "자기소개하기", "🙋", "a friendly person meeting the user for the first time at a networking event", "The user introduces themselves: name, job, where they live, hobbies.", "Hi, I don't think we've met. I'm Alex. What's your name?"),
  s("apology", "love", "약속 늦어서 사과하기", "⏰", "the user's friend who has been waiting 20 minutes", "The user apologizes for being late, explains why, and makes it up.", "Oh, there you are! I was starting to get worried."),
  // 🔧 repair & services
  s("laptop", "service", "노트북 수리 맡기기", "💻", "a technician at a computer repair shop", "The user explains the laptop problem (won't turn on, slow, broken screen), asks about cost and time, and drops it off.", "Hi there, what seems to be the problem with your computer?"),
  s("phoneRepair", "service", "휴대폰 액정 수리", "📱", "a staff member at a phone repair store", "The user gets a cracked screen fixed: price, waiting time, data safety.", "Hey! Oh no, that screen looks rough. What happened?"),
  s("refund", "service", "교환·환불하기", "🧾", "a customer service clerk at a store", "The user explains a problem with something they bought and asks for an exchange or refund.", "Hello, how can I help you today?"),
  s("pharmacy", "service", "약국에서 약 사기", "💊", "a pharmacist", "The user describes symptoms (headache, cold, stomachache) and gets medicine and advice.", "Hi, what can I help you with today?"),
  s("doctor", "service", "병원 진료 받기", "🩺", "a doctor at a walk-in clinic", "The user explains symptoms, how long they've had them, and asks about treatment.", "Hi, I'm Dr. Miller. So what brings you in today?"),
  s("haircut", "service", "미용실에서 머리 자르기", "💇", "a hairstylist at a salon", "The user explains how they want their hair cut and makes small talk.", "Hi! Have a seat. What are we doing today?"),
  s("laundry", "service", "세탁소 맡기기", "👔", "a clerk at a dry cleaner", "The user drops off clothes, points out a stain, and asks when it will be ready.", "Hi there! Dropping off or picking up?"),
  s("carService", "service", "자동차 정비소", "🛠️", "a mechanic at an auto repair shop", "The user describes a car problem (strange noise, warning light) and asks about cost and time.", "Hey, what's going on with the car?"),
  s("landlord", "service", "집주인에게 고장 신고", "🏠", "the user's landlord answering a phone call", "The user reports something broken in the apartment (heater, leak) and asks when it can be fixed.", "Hello, this is Mike. What's up?"),
  s("delivery", "service", "택배 분실 문의 전화", "📞", "a customer service agent for a delivery company on the phone", "The user reports a missing package: tracking number, address, what to do next.", "Thanks for calling. How can I help you today?"),
  s("phone", "service", "전화로 식당 예약하기", "☎️", "a receptionist answering the phone at a restaurant", "The user books a table: date, time, number of people, name, phone number.", "Thank you for calling Bella Cucina. How can I help you?"),
  s("bank", "service", "은행 업무", "🏦", "a bank teller", "The user opens an account, exchanges money, or asks about a card problem.", "Good afternoon. What can I do for you today?"),
  // 💼 work
  s("smalltalk", "work", "회사 동료와 스몰토크", "☕", "a friendly coworker chatting in the office break room", "Casual small talk: weekend plans, weather, work, hobbies.", "Hey, good morning! How was your weekend?"),
  s("meeting", "work", "회의에서 의견 말하기", "📊", "a team leader running a short team meeting", "The user shares a work update, gives an opinion, and agrees or politely disagrees.", "Okay everyone, let's get started. Could you give us a quick update on your project?"),
  s("interview", "work", "영어 면접 보기", "🤝", "a friendly hiring manager doing a job interview", "Classic interview questions: tell me about yourself, strengths, why this job.", "Thanks for coming in today. So, tell me a little about yourself."),
  s("askHelp", "work", "동료에게 도움 요청", "🙏", "a busy but kind coworker at their desk", "The user asks for help with a task, explains the problem, and thanks them.", "Hey, what's up? Need something?"),
  s("dayOff", "work", "상사에게 휴가 요청", "🏖️", "the user's manager in a quick one-on-one", "The user asks for days off: dates, reason, who covers their work.", "Hey, come on in. You wanted to talk?"),
];
