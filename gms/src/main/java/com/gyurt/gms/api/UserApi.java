package com.gyurt.gms.api;

import com.gyurt.gms.repo.User;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/users")
public interface UserApi {
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    User create(@RequestBody User user);

    @GetMapping("/{email}")
    User findByEmail(@PathVariable String email) throws UserNotFoundException;

    @PutMapping
    User update(@RequestBody User user) throws UserNotFoundException;

    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id) throws UserNotFoundException;
}
