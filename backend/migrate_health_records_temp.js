require('dotenv').config({ path: '../../backend/.env' });
const mongoose = require('mongoose');

// Define temporary models for the script
const PetSchema = new mongoose.Schema({
    vaccinations: [{ name: String, date: String, nextDue: String }],
    medicalHistory: [{ condition: String, date: String, notes: String }]
}, { strict: false });

const HealthRecordSchema = new mongoose.Schema({
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    recordType: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    nextDueDate: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const Pet = mongoose.model('PetMigration', PetSchema, 'pets');
const HealthRecord = mongoose.model('HealthRecordMigration', HealthRecordSchema, 'healthrecords');

async function migrate() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error('MONGO_URI not found in .env');

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for migration...');

        const pets = await Pet.find({});
        console.log(`Found ${pets.length} pets to check.`);

        let createdCount = 0;

        for (const pet of pets) {
            const recordsToAdd = [];

            // Migrate vaccinations
            if (pet.vaccinations && pet.vaccinations.length > 0) {
                for (const v of pet.vaccinations) {
                    if (!v.name) continue;
                    
                    // Check if already exists in HealthRecord to avoid duplicates
                    const exists = await HealthRecord.findOne({
                        petId: pet._id,
                        recordType: 'Vaccination',
                        description: v.name,
                        date: v.date
                    });

                    if (!exists) {
                        recordsToAdd.push({
                            petId: pet._id,
                            recordType: 'Vaccination',
                            date: v.date || new Date().toISOString().split('T')[0],
                            description: v.name,
                            nextDueDate: v.nextDue || ''
                        });
                    }
                }
            }

            // Migrate medical history
            if (pet.medicalHistory && pet.medicalHistory.length > 0) {
                for (const m of pet.medicalHistory) {
                    if (!m.condition) continue;

                    const exists = await HealthRecord.findOne({
                        petId: pet._id,
                        recordType: 'Treatment',
                        description: new RegExp('^' + m.condition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
                        date: m.date
                    });

                    if (!exists) {
                        recordsToAdd.push({
                            petId: pet._id,
                            recordType: 'Treatment',
                            date: m.date || new Date().toISOString().split('T')[0],
                            description: m.condition + (m.notes ? `: ${m.notes}` : '')
                        });
                    }
                }
            }

            if (recordsToAdd.length > 0) {
                await HealthRecord.insertMany(recordsToAdd);
                createdCount += recordsToAdd.length;
            }
        }

        console.log(`Migration complete! Created ${createdCount} standalone health records.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
