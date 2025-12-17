export default class UserDto {
  constructor(user) {
    this.id = user._id || user.id || null;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
  }

  static fromArray(users) {
    return users.map((user) => new UserDto(user));
  }

  static from(user) {
    return new UserDto(user);
  }
}
