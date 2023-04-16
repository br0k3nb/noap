import mongoose from 'mongoose';
import MailSchema from '../schemas/MailSchema.js';

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

MailSchema.plugin(mongooseAggregatePaginate);

const Mail = mongoose.model('Mail', MailSchema, 'mails');

Mail.createIndexes();

export default Mail;