export const io = {
  connect: jest.fn().mockReturnValue({
    connect: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
    close: jest.fn(),
    connected: true,
  }),
};
