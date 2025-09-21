package com.gyurt.gms.api;

import com.gyurt.gms.repo.User;
import com.gyurt.gms.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController implements UserApi{

    private final UserRepository userRepository;

    @Override
    @ResponseStatus(HttpStatus.CREATED)
    public User create(@RequestBody User user){
        return userRepository.save(user);
    }

    @Override
    public User findByEmail(@PathVariable String email) throws UserNotFoundException{
        return userRepository.findByEmail(email).orElseThrow(UserNotFoundException::new);
    }

    @Override
    public User update(@RequestBody User user) throws UserNotFoundException{
        userRepository.findById(user.getId()).orElseThrow(UserNotFoundException::new);
        return userRepository.save(user);
    }

    @Override
    public void delete(@PathVariable Long id) throws UserNotFoundException{
        userRepository.findById(id).orElseThrow(UserNotFoundException::new);
        userRepository.deleteById(id);
    }

    @ExceptionHandler(UserNotFoundException.class)
    protected ResponseEntity<String> handleNotFound(Exception e){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }
}
