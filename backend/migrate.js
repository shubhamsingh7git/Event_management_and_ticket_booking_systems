const mongoose = require('mongoose');
const User = require('./models/userModel');
const Event = require('./models/eventModel');
const Booking = require('./models/bookingModel');

const localURI = 'mongodb://127.0.0.1:27017/ematbs';
const atlasURI = 'mongodb+srv://ematbsadmin:Ematbs_2026@cluster0.ubis1uq.mongodb.net/ematbs?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
    try {
        console.log('Connecting to Local DB...');
        const localDb = await mongoose.createConnection(localURI).asPromise();
        console.log('Connected to Local DB.');

        const LocalUser = localDb.model('User', User.schema);
        const LocalEvent = localDb.model('Event', Event.schema);
        const LocalBooking = localDb.model('Booking', Booking.schema);

        console.log('Fetching local data...');
        const users = await LocalUser.find({}).lean();
        const events = await LocalEvent.find({}).lean();
        const bookings = await LocalBooking.find({}).lean();
        console.log(`Found ${users.length} users, ${events.length} events, ${bookings.length} bookings.`);

        console.log('Connecting to Atlas DB...');
        const atlasDb = await mongoose.createConnection(atlasURI).asPromise();
        console.log('Connected to Atlas DB.');

        const AtlasUser = atlasDb.model('User', User.schema);
        const AtlasEvent = atlasDb.model('Event', Event.schema);
        const AtlasBooking = atlasDb.model('Booking', Booking.schema);

        console.log('Clearing existing data in Atlas (if any)...');
        await AtlasUser.deleteMany({});
        await AtlasEvent.deleteMany({});
        await AtlasBooking.deleteMany({});

        console.log('Migrating users...');
        if(users.length > 0) await AtlasUser.insertMany(users);
        console.log('Migrating events...');
        if(events.length > 0) await AtlasEvent.insertMany(events);
        console.log('Migrating bookings...');
        if(bookings.length > 0) await AtlasBooking.insertMany(bookings);

        console.log('Database Migration Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}
migrate();
