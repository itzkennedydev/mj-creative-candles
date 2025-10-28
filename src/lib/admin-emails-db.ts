import { MongoClient } from 'mongodb';
import { env } from '~/env.js';

const client = new MongoClient(env.MONGODB_URI);

export interface AdminEmail {
  _id?: string;
  email: string;
  name?: string;
  addedAt: Date;
  addedBy: string;
  isActive: boolean;
}

export async function getAuthorizedEmails(): Promise<AdminEmail[]> {
  try {
    await client.connect();
    const db = client.db('stitch_orders');
    const collection = db.collection<AdminEmail>('admin_emails');
    
    const emails = await collection.find({ isActive: true }).toArray();
    return emails;
  } catch (error) {
    console.error('Error fetching authorized emails:', error);
    return [];
  } finally {
    await client.close();
  }
}

export async function isEmailAuthorized(email: string): Promise<boolean> {
  try {
    await client.connect();
    const db = client.db('stitch_orders');
    const collection = db.collection<AdminEmail>('admin_emails');
    
    const adminEmail = await collection.findOne({ 
      email: email.toLowerCase().trim(), 
      isActive: true 
    });
    
    return !!adminEmail;
  } catch (error) {
    console.error('Error checking email authorization:', error);
    return false;
  } finally {
    await client.close();
  }
}

export async function addAuthorizedEmail(email: string, name: string, addedBy: string): Promise<boolean> {
  try {
    await client.connect();
    const db = client.db('stitch_orders');
    const collection = db.collection<AdminEmail>('admin_emails');
    
    // Check if email already exists
    const existingEmail = await collection.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (existingEmail) {
      // Update existing email to active
      await collection.updateOne(
        { email: email.toLowerCase().trim() },
        { 
          $set: { 
            isActive: true, 
            addedAt: new Date(),
            addedBy: addedBy,
            name: name
          } 
        }
      );
    } else {
      // Insert new email
      await collection.insertOne({
        email: email.toLowerCase().trim(),
        name: name,
        addedAt: new Date(),
        addedBy: addedBy,
        isActive: true
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding authorized email:', error);
    return false;
  } finally {
    await client.close();
  }
}

export async function removeAuthorizedEmail(email: string): Promise<boolean> {
  try {
    await client.connect();
    const db = client.db('stitch_orders');
    const collection = db.collection<AdminEmail>('admin_emails');
    
    await collection.updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { isActive: false } }
    );
    
    return true;
  } catch (error) {
    console.error('Error removing authorized email:', error);
    return false;
  } finally {
    await client.close();
  }
}

// Initialize with default admin emails
export async function initializeDefaultAdminEmails(): Promise<void> {
  try {
    await client.connect();
    const db = client.db('stitch_orders');
    const collection = db.collection<AdminEmail>('admin_emails');
    
    const defaultEmails = [
      {
        email: 'itskennedy.dev@gmail.com',
        name: 'Kennedy',
        addedAt: new Date(),
        addedBy: 'system',
        isActive: true
      },
      {
        email: 'pleasestitch18@gmail.com',
        name: 'Tanika',
        addedAt: new Date(),
        addedBy: 'system',
        isActive: true
      }
    ];
    
    for (const emailData of defaultEmails) {
      const existingEmail = await collection.findOne({ 
        email: emailData.email 
      });
      
      if (!existingEmail) {
        await collection.insertOne(emailData);
      }
    }
    
    console.log('Default admin emails initialized');
  } catch (error) {
    console.error('Error initializing default admin emails:', error);
  } finally {
    await client.close();
  }
}
