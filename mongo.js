const mongoose = require('mongoose')

if (process.argv.length < 3) {
	console.log('give password as argument')
	process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://ni_idea:${password}@cluster0.dp7cqie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const contactSchema = new mongoose.Schema({ name: String, number: String })

const Contact = mongoose.model('Contact', contactSchema)

if (process.argv.length === 5) {
	const contact = new Contact({ name: process.argv[3], number: process.argv[4] })
	contact.save().then(() => {
		console.log(`added ${contact.name} number ${contact.number} to phonebook`)
		mongoose.connection.close()
	})
}
else {
	Contact.find({}).then(result => {
		console.log('phonebook:')
		result.forEach(person => console.log(person.name, person.number))
		mongoose.connection.close()
	})
}


