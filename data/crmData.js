export const companies = [
  { id: 1, name: "The Dragonfly Inn", domain: "thedragonfly.com", phone: "555-5555", city: "Stars Hollow", industry: "Hospitality" },
  { id: 2, name: "Pawnee Parks Dept.", domain: "pawneeparks.com", phone: "888-8888", city: "Pawnee", industry: "Government" },
  { id: 3, name: "The Good Place", domain: "thegoodplace.com", phone: "000-2222", city: "Good Place", industry: "Hospitality" },
];
export const contacts = [
  { id: 12345, first: "Lorelai", last: "Gilmore", email: "lorelai@thedragonfly.com", company: "The Dragonfly Inn", domain: "thedragonfly.com", phone: "+18005552222", favorite: "Coffee", role: "Primary contact" },
  { id: 67891, first: "Leslie", last: "Knope", email: "leslie@pawneeparks.com", company: "Pawnee Parks Dept.", domain: "pawneeparks.com", phone: "+18004321234", favorite: "Waffles", role: "Department lead" },
  { id: 11121, first: "Eleanor", last: "Shellstrop", email: "eleanor@thegoodplace.com", company: "The Good Place", domain: "thegoodplace.com", phone: "+18005431234", favorite: "Shrimp", role: "Primary contact" },
];
export const deals = [
  { id: 1234567, name: "Dragonfly Inn Coffee order", company: "The Dragonfly Inn", domain: "thedragonfly.com", pipeline: "Sales pipeline", stage: "Appointment scheduled", amount: 500, close: "Jan 22, 2021" },
  { id: 9876541, name: "Pawnee Parks lemonade", company: "Pawnee Parks Dept.", domain: "pawneeparks.com", pipeline: "Sales pipeline", stage: "Qualified to buy", amount: 1200, close: "Feb 15, 2021" },
  { id: 7654321, name: "Good Place frozen yogurt", company: "The Good Place", domain: "thegoodplace.com", pipeline: "Sales pipeline", stage: "Contract sent", amount: 800, close: "Dec 20, 2020" },
];
export const notes = [
  { id: 1, company: "The Dragonfly Inn", deal: "Dragonfly Inn Coffee order", body: "They like strong coffee.", date: "Jan 22, 2021" },
  { id: 2, company: "Pawnee Parks Dept.", deal: "Pawnee Parks lemonade", body: "Ordering lemonade for a new park project.", date: "Feb 15, 2021" },
  { id: 3, company: "The Good Place", deal: "Good Place frozen yogurt", body: "Contracting to refill frozen yogurt supply every month.", date: "Dec 20, 2020" },
];
export const emails = [
  { id: 1, contactId: 12345, subject: "Checking in about contract", status: "Sent", body: "Wanted to check in and see if you had a chance to view the contract.", direction: "Outgoing" },
  { id: 2, contactId: 67891, subject: "Following up on support ticket", status: "Sent", body: "Following up on our conversation last week.", direction: "Incoming" },
  { id: 3, contactId: 11121, subject: "Onboarding information", status: "Scheduled", body: "Information to help you get started using our product.", direction: "Outgoing" },
];
export const calls = [
  { id: 1, title: "Prospecting call", contact: "John Smith", email: "jsmith@example.com", direction: "Outbound", source: "VoIP", status: "Busy", date: "Oct 12, 2022", notes: "Went to voicemail. Will try again next week." },
  { id: 2, title: "Follow-up call", contact: "Ann Smith", email: "asmith@test.com", direction: "Inbound", source: "Zoom", status: "Completed", date: "Oct 14, 2022", notes: "Held a Zoom meeting to follow up on proposal." },
];
export const initialTasks = [
  { id: 1, dealId: 1234567, title: "Call decision makers", notes: "Make a follow up call to the decision making team.", priority: "Medium", status: "In Progress", type: "Call", due: "Oct 12, 2022" },
  { id: 2, dealId: 9876541, title: "Email contract", notes: "Send the contract to the team.", priority: "High", status: "Completed", type: "Email", due: "Oct 13, 2022" },
];
