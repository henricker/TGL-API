import { CompressionTypes, Kafka, Message, Producer as KafkaProducer } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'api',
  brokers: ['localhost:9092'],
})

class Producer {
  private producer: KafkaProducer

  constructor() {
    this.producer = kafka.producer({
      allowAutoTopicCreation: true,
    })
  }

  public async connect() {
    await this.producer.connect()
  }

  public async disconect() {
    await this.producer.disconnect()
  }

  public async sendMessage(
    messages: Array<Message>,
    topic: string,
    compression?: CompressionTypes
  ) {
    await this.producer.send({
      topic,
      messages,
      compression,
    })
  }
}

export default new Producer()
